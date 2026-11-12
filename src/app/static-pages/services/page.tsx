"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useConfirmDelete } from "@/app/components/ConfirmDeleteModal";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/PageHeader";
import { SelectField } from "@/components/SelectField";
import { GlobalSectionRef } from "@/app/components/GlobalSectionRef";
import { clearCache, fetchWithCache } from "@/lib/apiCache";
import { uploadFiles } from "@/app/lib/uploadHelpers";
import type { TechLogo } from "@/lib/siteFooter";
import type { LogoOrIcon, LogoOrIconChange } from "@/app/components/IconPicker";
import { ServiceHero } from "./components/ServiceHero";
import { ServiceApproach } from "./components/ServiceApproach";
import { ServiceDeliver } from "./components/ServiceDeliver";
import { ServiceProof } from "./components/ServiceProof";
import { ServiceStack } from "./components/ServiceStack";
import { AddServiceModal, type NewService } from "./components/AddServiceModal";
import {
  LEGACY_SERVICE_IDS,
  SERVICE_OPTIONS,
  isBuiltInService,
  serviceOptionsFrom,
  createDefaultServiceData,
  normalizeServiceData,
  type ServiceOption,
  type ServicePageData,
} from "./types";

export default function ServicesCMS() {
  const [selectedServiceId, setSelectedServiceId] = useState(SERVICE_OPTIONS[0].id);
  const [formData, setFormData] = useState<ServicePageData>(createDefaultServiceData);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // The services stored in the CMS (built-in ones minus deleted, plus added); null until loaded
  const [storedServices, setStoredServices] = useState<ServiceOption[] | null>(null);
  const [showAddService, setShowAddService] = useState(false);
  const confirmDelete = useConfirmDelete();

  const loadAddedServices = () =>
    fetch("/api/services")
      .then((r) => r.json())
      .then((json) => {
        if (json?.success) setStoredServices(serviceOptionsFrom(json.data));
      })
      .catch(console.error);
  useEffect(() => {
    loadAddedServices();
  }, []);

  const allOptions = useMemo(() => storedServices ?? SERVICE_OPTIONS, [storedServices]);
  // If the selected service was deleted (e.g. the default one), open the first that exists
  useEffect(() => {
    if (
      storedServices &&
      selectedServiceId &&
      !storedServices.some((s) => s.id === selectedServiceId)
    ) {
      setSelectedServiceId(storedServices[0]?.id ?? "");
    }
  }, [storedServices, selectedServiceId]);
  const selectorOptions = useMemo(
    () => [
      { value: "", label: "Select a service page..." },
      ...allOptions.map((opt) => ({ value: opt.id, label: opt.label })),
    ],
    [allOptions],
  );
  const relatedOptions = useMemo(
    () => allOptions.filter((o) => !LEGACY_SERVICE_IDS.includes(o.id)),
    [allOptions],
  );

  const selectedService = storedServices?.find((s) => s.id === selectedServiceId);

  /** Deletes a service with its menu link, SEO, sitemap entry and home pillar card. */
  const deleteService = async () => {
    if (!selectedService) return;
    const name = formData.hero.name || selectedService.id;
    const confirmed = await confirmDelete({
      title: `Delete ${name}?`,
      message: `The page /service/${selectedService.id}, all its content and SEO settings, its Services menu link (navbar, footer and sitemap) and its card on the home page Service Pillars will all be removed.`,
      warning: isBuiltInService(selectedService.id)
        ? "This is one of the original services. Its page will return 404 until you add it again with the same URL slug, and its content can't be restored."
        : undefined,
      confirmLabel: "Delete service",
    });
    if (!confirmed) return;
    const tid = toast.loading(`Deleting ${name}...`);
    try {
      const res = await fetch(`/api/services?id=${encodeURIComponent(selectedService.id)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json?.error || "Could not delete the service.");
      clearCache("/api/services");
      clearCache(`/api/services?id=${selectedService.id}`);
      const remaining = (storedServices ?? []).filter((s) => s.id !== selectedService.id);
      setStoredServices(remaining);
      setSelectedServiceId(remaining[0]?.id ?? "");
      loadAddedServices();
      toast.success(`${name} deleted.`, { id: tid });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Network error.", { id: tid });
    }
  };

  const createService = async (service: NewService) => {
    const tid = toast.loading(`Creating ${service.name}...`);
    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(service),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json?.error || "Could not create the service.");
      clearCache("/api/services");
      await loadAddedServices();
      setSelectedServiceId(service.id);
      setShowAddService(false);
      toast.success(`${service.name} created. Fill in its content below.`, { id: tid });
      (json.notes as string[] | undefined)?.forEach((note) => toast(note, { duration: 6000 }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Network error.", { id: tid });
    }
  };
  // Tech logos are shared by all services (GlobalConfig.siteImages.techLogos)
  const [techLogos, setTechLogos] = useState<TechLogo[]>([]);
  // One pending change per tech key: a new logo file, a library icon, or clear (built-in icon)
  const [pendingTech, setPendingTech] = useState<Record<string, LogoOrIconChange>>({});

  useEffect(() => {
    fetch("/api/seo/global")
      .then((r) => r.json())
      .then((json) => {
        const list = json?.data?.siteImages?.techLogos;
        if (Array.isArray(list)) setTechLogos(list);
      })
      .catch(console.error);
  }, []);

  const techKey = (name: string) => name.trim().toLowerCase();
  const findTechLogo = (list: TechLogo[], name: string) => {
    const key = techKey(name);
    return list.find(
      (t) => t.name === key || (Array.isArray(t.matches) && t.matches.includes(key)),
    );
  };
  /** A technology's logo or icon as shown in the CMS, including unsaved changes (never both). */
  const techValueFor = (name: string): LogoOrIcon => {
    const change = pendingTech[techKey(name)];
    if (change && "file" in change) return { image: change.file, icon: null };
    if (change && "icon" in change) return { image: null, icon: change.icon };
    if (change) return { image: null, icon: null };
    const stored = findTechLogo(techLogos, name);
    return stored?.image
      ? { image: stored.image, icon: null }
      : { image: null, icon: stored?.icon || null };
  };
  const changeTech = (name: string, change: LogoOrIconChange) =>
    setPendingTech((prev) => ({ ...prev, [techKey(name)]: change }));

  /** Uploads logos and saves icons picked in the Tech Stack card into the shared list. */
  const saveTechLogos = async () => {
    const changes = Object.entries(pendingTech);
    if (changes.length === 0) return;
    const files = changes.filter(([, c]) => "file" in c) as [string, { file: File }][];
    const urls = files.length > 0 ? await uploadFiles(files.map(([, c]) => c.file)) : [];
    const uploaded = Object.fromEntries(files.map(([name], i) => [name, urls[i] || ""]));
    let next = [...techLogos];
    for (const [name, change] of changes) {
      const existing = findTechLogo(next, name);
      const base: TechLogo = existing ?? { name, image: "", matches: [name] };
      // A logo and an icon replace each other, so each entry keeps only one of them
      let entry: TechLogo | null;
      if ("file" in change) {
        if (!uploaded[name]) continue;
        entry = { ...base, image: uploaded[name] };
        delete entry.icon;
      } else if ("icon" in change) {
        entry = { ...base, image: "", icon: change.icon };
      } else {
        entry = null; // cleared: the website falls back to its built-in icon
      }
      next = existing
        ? next.flatMap((t) => (t === existing ? (entry ? [entry] : []) : [t]))
        : entry
          ? [...next, entry]
          : next;
    }
    const res = await fetch("/api/seo/global", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ config: { siteImages: { techLogos: next } } }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json?.error || "Could not save the tech logos.");
    setTechLogos(next);
    setPendingTech({});
  };

  useEffect(() => {
    if (!selectedServiceId) {
      setFormData(createDefaultServiceData());
      setIsLoading(false);
      return;
    }

    let active = true;
    setIsLoading(true);
    fetchWithCache(`/api/services?id=${selectedServiceId}`)
      .then((json) => {
        if (!active) return;
        if (json?.success && json.data) {
          setFormData(normalizeServiceData(json.data));
        } else {
          setFormData(createDefaultServiceData());
        }
      })
      .catch((err) => {
        console.error(err);
        if (active) setFormData(createDefaultServiceData());
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedServiceId]);

  const handleSave = async () => {
    if (!selectedServiceId) {
      toast.error("Please select a service first.");
      return;
    }

    setIsSaving(true);
    const tid = toast.loading(`Saving ${selectedServiceId}...`);
    try {
      await saveTechLogos();
      const uploadedUrls = await uploadFiles([formData.hero.imageUrl || ""]);
      const cleanList = (list: string[]) => (list || []).map((item) => item.trim()).filter(Boolean);

      const payload: ServicePageData = {
        ...formData,
        hero: {
          ...formData.hero,
          imageUrl: uploadedUrls[0] || "",
        },
        services: (formData.services || []).map((item, idx) => ({
          ...item,
          number: item.number || String(idx + 1).padStart(2, "0"),
          tags: cleanList(item.tags),
        })),
        proof: (formData.proof || []).map((item) => ({
          ...item,
          metrics: (item.metrics || []).filter((m) => m.value.trim() || m.label.trim()),
        })),
        work: cleanList(formData.work),
        stack: cleanList(formData.stack),
        related: cleanList(formData.related),
      };

      const res = await fetch("/api/services", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedServiceId,
          content: payload,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.error || "Failed to save.");
      }
      clearCache(`/api/services?id=${selectedServiceId}`);
      clearCache("/api/services");
      setFormData(payload);
      toast.success("Service content saved and published!", { id: tid });
    } catch (err) {
      console.error("Save error:", err);
      toast.error(err instanceof Error ? err.message : "Network error.", { id: tid });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="flex flex-col gap-6 pb-16">
      <PageHeader
        title="Services Pages Content"
        description="Manage all sections displayed on each live /service/[slug] page, in exact website order."
      />

      <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:flex-row md:items-end">
        <SelectField
          label="Select Service Page"
          value={selectedServiceId}
          onChange={(e) => setSelectedServiceId(e.target.value)}
          options={selectorOptions}
          containerClassName="flex-1"
        />
        <button
          type="button"
          onClick={() => setShowAddService(true)}
          className="inline-flex h-[50px] shrink-0 items-center justify-center gap-1.5 rounded-2xl bg-[#0B0F29] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#0B0F29]/90"
        >
          <Plus className="h-4 w-4" /> Add service
        </button>
        {selectedService && (
          <button
            type="button"
            onClick={deleteService}
            disabled={isSaving}
            title="Delete this service and remove it from the menu, SEO and sitemap"
            className="inline-flex h-[50px] shrink-0 items-center justify-center gap-1.5 rounded-2xl border border-red-200 bg-white px-5 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50 disabled:opacity-40"
          >
            <Trash2 className="h-4 w-4" /> Delete service
          </button>
        )}
      </div>
      {showAddService && (
        <AddServiceModal
          takenIds={allOptions.map((o) => o.id)}
          onClose={() => setShowAddService(false)}
          onCreate={createService}
        />
      )}

      {!selectedServiceId ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-gray-400">
          Choose a service page above to edit its content.
        </div>
      ) : isLoading ? (
        <div className="rounded-2xl border border-gray-100 bg-white py-12 text-center text-sm font-medium text-gray-400 shadow-sm">
          Loading service content...
        </div>
      ) : (
        <>
          <ServiceHero
            data={formData.hero}
            onChange={(hero) => setFormData((prev) => ({ ...prev, hero }))}
            isSaving={isSaving}
            onSave={handleSave}
          />
          <ServiceApproach
            data={formData.hero}
            onChange={(hero) => setFormData((prev) => ({ ...prev, hero }))}
            isSaving={isSaving}
            onSave={handleSave}
          />
          <ServiceDeliver
            services={formData.services}
            onChange={(services) => setFormData((prev) => ({ ...prev, services }))}
            isSaving={isSaving}
            onSave={handleSave}
          />
          <ServiceProof
            proof={formData.proof}
            work={formData.work}
            onProofChange={(proof) => setFormData((prev) => ({ ...prev, proof }))}
            onWorkChange={(work) => setFormData((prev) => ({ ...prev, work }))}
            isSaving={isSaving}
            onSave={handleSave}
          />
          <ServiceStack
            currentSlug={selectedServiceId}
            serviceOptions={relatedOptions}
            stack={formData.stack}
            related={formData.related}
            onStackChange={(stack) => setFormData((prev) => ({ ...prev, stack }))}
            onRelatedChange={(related) => setFormData((prev) => ({ ...prev, related }))}
            techLogoFor={(name) => techValueFor(name).image}
            onPickTechLogo={(name, file) => changeTech(name, { file })}
            techValueFor={techValueFor}
            onTechChange={changeTech}
            isSaving={isSaving}
            onSave={handleSave}
          />
          <GlobalSectionRef
            title="Growth CTA & Brief Modal"
            description="Let's Talk CTA section, office timezone clocks, and project brief modal copy (shared globally across the site)."
          />
        </>
      )}
    </section>
  );
}
