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
  Tag,
  DollarSign,
  Target,
  Globe,
  Trash2,
} from "lucide-react";
import { InputField } from "@/app/components/InputField";
import { useConfirmDelete } from "@/app/components/ConfirmDeleteModal";
import { SubmissionDetailModal } from "@/app/components/SubmissionDetailModal";
import toast from "react-hot-toast";

interface Enquiry {
  id: string;
  name: string;
  email: string;
  interestedIn: string | null;
  budget: string | null;
  projectGoals: string | null;
  sourcePage: string | null;
  status: string;
  createdAt: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const confirmDelete = useConfirmDelete();

  const fetchEnquiries = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/enquiries?page=${page}&search=${searchQuery}`);
      const json = await res.json();
      if (json.success) {
        setEnquiries(json.data);
        setPagination(json.pagination);
      } else {
        toast.error(json.error || "Failed to fetch enquiries");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [page, searchQuery]);

  const handleDelete = async (enquiry: Enquiry) => {
    const confirmed = await confirmDelete({
      title: "Delete this enquiry?",
      message: `Remove enquiry from ${enquiry.name} (${enquiry.email})?`,
    });
    if (!confirmed) return;

    setDeletingId(enquiry.id);
    try {
      const res = await fetch(`/api/enquiries?id=${encodeURIComponent(enquiry.id)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Enquiry deleted");
        if (selectedEnquiry?.id === enquiry.id) setSelectedEnquiry(null);
        if (enquiries.length === 1 && page > 1) {
          setPage(page - 1);
        } else {
          fetchEnquiries();
        }
      } else {
        toast.error(json.error || "Failed to delete enquiry");
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
        title="Enquiries"
        description="View and manage service inquiries from your landing page."
      />

      <div className="flex flex-col items-center justify-between gap-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm md:flex-row">
        <InputField
          placeholder="Search by name, email, or page..."
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
                  Page
                </th>
                <th className="px-6 py-4 text-[11px] font-bold tracking-widest text-gray-400 uppercase">
                  Interest
                </th>
                <th className="px-6 py-4 text-[11px] font-bold tracking-widest text-gray-400 uppercase">
                  Budget
                </th>
                <th className="px-6 py-4 text-[11px] font-bold tracking-widest text-gray-400 uppercase">
                  Date
                </th>
                <th className="px-6 py-4 pr-8 text-right text-[11px] font-bold tracking-widest text-gray-400 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#D4AF37]" />
                  </td>
                </tr>
              ) : enquiries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-gray-400 italic">
                    No enquiries found.
                  </td>
                </tr>
              ) : (
                enquiries.map((enquiry) => (
                  <tr key={enquiry.id} className="group transition-colors hover:bg-gray-50/50">
                    <td className="px-6 py-5 pl-8">
                      <div className="flex flex-col">
                        <span className="flex items-center gap-2 font-bold text-gray-900">
                          <User className="h-3.5 w-3.5 text-gray-400" />
                          {enquiry.name}
                        </span>
                        <span className="mt-0.5 flex items-center gap-2 text-sm text-gray-500">
                          <Mail className="h-3.5 w-3.5 text-gray-400" />
                          {enquiry.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span
                        title={enquiry.sourcePage || "Not recorded"}
                        className="inline-flex max-w-[200px] items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700"
                      >
                        <Globe className="h-3 w-3 shrink-0 text-gray-400" />
                        <span className="truncate">{enquiry.sourcePage || "Not recorded"}</span>
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold tracking-wider text-blue-600 uppercase">
                        <Tag className="h-3 w-3" />
                        {enquiry.interestedIn || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-5 font-medium text-gray-900">
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="h-3.5 w-3.5 text-green-500" />
                        {enquiry.budget || "Not Specified"}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-[13px] text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        {new Date(enquiry.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-5 pr-8 text-right">
                      <div className="inline-flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedEnquiry(enquiry)}
                          title="View project goals"
                          aria-label="View project goals"
                          className="rounded-xl bg-gray-50 p-2 text-gray-400 transition-all hover:bg-[#D4AF37] hover:text-[#0B0F29]"
                        >
                          <Target className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === enquiry.id}
                          onClick={() => handleDelete(enquiry)}
                          title="Delete enquiry"
                          aria-label="Delete enquiry"
                          className="rounded-xl bg-gray-50 p-2 text-gray-400 transition-all hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        >
                          {deletingId === enquiry.id ? (
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

        {/* Pagination */}
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
        isOpen={Boolean(selectedEnquiry)}
        onClose={() => setSelectedEnquiry(null)}
        eyebrow="Service Enquiry"
        title={selectedEnquiry?.name || ""}
        subtitle={selectedEnquiry?.email || undefined}
        meta={
          selectedEnquiry
            ? [
                { label: "Source Page", value: selectedEnquiry.sourcePage || "Not recorded" },
                { label: "Interest", value: selectedEnquiry.interestedIn || "N/A" },
                { label: "Budget", value: selectedEnquiry.budget || "Not Specified" },
                {
                  label: "Submitted",
                  value: new Date(selectedEnquiry.createdAt).toLocaleDateString(),
                },
              ]
            : []
        }
        bodyTitle="Project Goals & Message"
        body={selectedEnquiry?.projectGoals?.trim() || "No goals specified."}
        replyEmail={selectedEnquiry?.email}
      />
    </div>
  );
}
