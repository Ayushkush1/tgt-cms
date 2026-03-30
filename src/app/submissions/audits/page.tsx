"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/app/components/PageHeader";
import { Search, Loader2, ChevronLeft, ChevronRight, Mail, Calendar, User, Globe, MessageSquare } from "lucide-react";
import { InputField } from "@/app/components/InputField";
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
    } catch (error) {
      toast.error("Network error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAudits();
  }, [page, searchQuery]);

  return (
    <div className="flex flex-col gap-8 pb-20">
      <PageHeader
        title="Audit Requests"
        description="Review and manage website audit requests from your complimentary audit form."
      />

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <InputField
          placeholder="Search by name, email, or URL..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1);
          }}
          icon={<Search className="w-4 h-4" />}
          containerClassName="flex-1 w-full"
        />
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest pl-8">Name & Email</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Website URL</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Date Submitted</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest pr-8 text-right">Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#D4AF37]" />
                  </td>
                </tr>
              ) : audits.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-gray-400 italic">No audit requests found.</td>
                </tr>
              ) : (
                audits.map((audit) => (
                  <tr key={audit.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-5 pl-8">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          {audit.name}
                        </span>
                        <span className="text-sm text-gray-500 flex items-center gap-2 mt-0.5">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          {audit.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <a 
                        href={audit.webUrl.startsWith('http') ? audit.webUrl : `https://${audit.webUrl}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-600 transition-colors flex items-center gap-2 font-medium"
                      >
                        <Globe className="w-3.5 h-3.5 text-blue-400" />
                        {audit.webUrl}
                      </a>
                    </td>
                    <td className="px-6 py-5">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d1fadf] text-[#12b76a] text-[11px] font-bold uppercase tracking-wider">
                        {audit.status}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-[13px] text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {new Date(audit.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-5 pr-8 text-right">
                       <button 
                         onClick={() => alert(audit.improve || "No message specified")}
                         className="p-2 bg-gray-50 text-gray-400 rounded-xl hover:bg-[#D4AF37] hover:text-[#0B0F29] transition-all"
                       >
                         <MessageSquare className="w-4 h-4" />
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-8 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500 font-medium">
              Showing page <span className="text-[#0B0F29] font-bold">{page}</span> of <span className="text-[#0B0F29] font-bold">{pagination.totalPages}</span>
            </p>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition-all shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page === pagination.totalPages}
                onClick={() => setPage(page + 1)}
                className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition-all shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
