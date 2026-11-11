"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/app/components/PageHeader";
import {
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Mail,
  Calendar,
  User,
  Globe,
  MessageSquare,
  Trash2,
} from "lucide-react";
import { InputField } from "@/app/components/InputField";
import { useConfirmDelete } from "@/app/components/ConfirmDeleteModal";
import { SubmissionDetailModal } from "@/app/components/SubmissionDetailModal";
import toast from "react-hot-toast";

interface Audit {
  id: string;
  name: string;
  email: string;
  webUrl: string;
  improve: string | null;
  status: string;
  createdAt: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AuditsPage() {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const confirmDelete = useConfirmDelete();

  const fetchAudits = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/audits?page=${page}&search=${searchQuery}`);
      const json = await res.json();
      if (json.success) {
        setAudits(json.data);
        setPagination(json.pagination);
      } else {
        toast.error(json.error || "Failed to fetch audits");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAudits();
  }, [page, searchQuery]);

  const handleDelete = async (audit: Audit) => {
    const confirmed = await confirmDelete({
      title: "Delete this audit request?",
      message: `Remove audit request from ${audit.name} (${audit.email})?`,
    });
    if (!confirmed) return;

    setDeletingId(audit.id);
    try {
      const res = await fetch(`/api/audits?id=${encodeURIComponent(audit.id)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Audit request deleted");
        if (selectedAudit?.id === audit.id) setSelectedAudit(null);
        if (audits.length === 1 && page > 1) {
          setPage(page - 1);
        } else {
          fetchAudits();
        }
      } else {
        toast.error(json.error || "Failed to delete audit request");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-20">
      <PageHeader
        title="Audit Requests"
        description="Review and manage website audit requests from your complimentary audit form."
      />

      <div className="flex flex-col items-center justify-between gap-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm md:flex-row">
        <InputField
          placeholder="Search by name, email, or URL..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1);
          }}
          icon={<Search className="h-4 w-4" />}
          containerClassName="flex-1 w-full"
        />
      </div>

      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-6 py-4 pl-8 text-[11px] font-bold tracking-widest text-gray-400 uppercase">
                  Name & Email
                </th>
                <th className="px-6 py-4 text-[11px] font-bold tracking-widest text-gray-400 uppercase">
                  Website URL
                </th>
                <th className="px-6 py-4 text-[11px] font-bold tracking-widest text-gray-400 uppercase">
                  Status
                </th>
                <th className="px-6 py-4 text-[11px] font-bold tracking-widest text-gray-400 uppercase">
                  Date Submitted
                </th>
                <th className="px-6 py-4 pr-8 text-right text-[11px] font-bold tracking-widest text-gray-400 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#D4AF37]" />
                  </td>
                </tr>
              ) : audits.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-gray-400 italic">
                    No audit requests found.
                  </td>
                </tr>
              ) : (
                audits.map((audit) => (
                  <tr key={audit.id} className="group transition-colors hover:bg-gray-50/50">
                    <td className="px-6 py-5 pl-8">
                      <div className="flex flex-col">
                        <span className="flex items-center gap-2 font-bold text-gray-900">
                          <User className="h-3.5 w-3.5 text-gray-400" />
                          {audit.name}
                        </span>
                        <span className="mt-0.5 flex items-center gap-2 text-sm text-gray-500">
                          <Mail className="h-3.5 w-3.5 text-gray-400" />
                          {audit.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <a
                        href={
                          audit.webUrl.startsWith("http") ? audit.webUrl : `https://${audit.webUrl}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 font-medium text-blue-500 transition-colors hover:text-blue-600"
                      >
                        <Globe className="h-3.5 w-3.5 text-blue-400" />
                        {audit.webUrl}
                      </a>
                    </td>
                    <td className="px-6 py-5">
                      <div className="inline-flex items-center gap-2 rounded-full bg-[#d1fadf] px-3 py-1 text-[11px] font-bold tracking-wider text-[#12b76a] uppercase">
                        {audit.status}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-[13px] text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        {new Date(audit.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-5 pr-8 text-right">
                      <div className="inline-flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedAudit(audit)}
                          title="View audit message"
                          aria-label="View audit message"
                          className="rounded-xl bg-gray-50 p-2 text-gray-400 transition-all hover:bg-[#D4AF37] hover:text-[#0B0F29]"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === audit.id}
                          onClick={() => handleDelete(audit)}
                          title="Delete audit request"
                          aria-label="Delete audit request"
                          className="rounded-xl bg-gray-50 p-2 text-gray-400 transition-all hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        >
                          {deletingId === audit.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-8 py-4">
            <p className="text-sm font-medium text-gray-500">
              Showing page <span className="font-bold text-[#0B0F29]">{page}</span> of{" "}
              <span className="font-bold text-[#0B0F29]">{pagination.totalPages}</span>
            </p>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="rounded-xl border border-gray-200 bg-white p-2 text-gray-600 shadow-sm transition-all hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={page === pagination.totalPages}
                onClick={() => setPage(page + 1)}
                className="rounded-xl border border-gray-200 bg-white p-2 text-gray-600 shadow-sm transition-all hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <SubmissionDetailModal
        isOpen={Boolean(selectedAudit)}
        onClose={() => setSelectedAudit(null)}
        eyebrow="Audit Request"
        title={selectedAudit?.name || ""}
        subtitle={selectedAudit?.email || undefined}
        meta={
          selectedAudit
            ? [
                { label: "Website", value: selectedAudit.webUrl || "N/A" },
                { label: "Status", value: selectedAudit.status || "Pending" },
                {
                  label: "Submitted",
                  value: new Date(selectedAudit.createdAt).toLocaleDateString(),
                },
              ]
            : []
        }
        bodyTitle="What to Improve"
        body={selectedAudit?.improve?.trim() || "No message specified."}
        replyEmail={selectedAudit?.email}
      />
    </div>
  );
}
