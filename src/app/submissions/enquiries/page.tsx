"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/app/components/PageHeader";
import { Search, Loader2, ChevronLeft, ChevronRight, Mail, Calendar, User, Tag, DollarSign, Target } from "lucide-react";
import { InputField } from "@/app/components/InputField";
import toast from "react-hot-toast";

interface Enquiry {
  id: string;
  name: string;
  email: string;
  interestedIn: string | null;
  budget: string | null;
  projectGoals: string | null;
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
    } catch (error) {
      toast.error("Network error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [page, searchQuery]);

  return (
    <div className="flex flex-col gap-8 pb-20">
      <PageHeader
        title="Enquiries"
        description="View and manage service inquiries from your landing page."
      />

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <InputField
          placeholder="Search by name or email..."
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
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Interest</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Budget</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest pr-8 text-right">Goals</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#D4AF37]" />
                  </td>
                </tr>
              ) : enquiries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-gray-400 italic">No enquiries found.</td>
                </tr>
              ) : (
                enquiries.map((enquiry) => (
                  <tr key={enquiry.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-5 pl-8">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          {enquiry.name}
                        </span>
                        <span className="text-sm text-gray-500 flex items-center gap-2 mt-0.5">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          {enquiry.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[11px] font-bold uppercase tracking-wider">
                        <Tag className="w-3 h-3" />
                        {enquiry.interestedIn || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-5 font-medium text-gray-900">
                        <div className="flex items-center gap-1.5">
                            <DollarSign className="w-3.5 h-3.5 text-green-500" />
                            {enquiry.budget || "Not Specified"}
                        </div>
                    </td>
                    <td className="px-6 py-5 text-[13px] text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {new Date(enquiry.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-5 pr-8 text-right">
                       <button 
                         onClick={() => alert(enquiry.projectGoals || "No goals specified")}
                         className="p-2 bg-gray-50 text-gray-400 rounded-xl hover:bg-[#D4AF37] hover:text-[#0B0F29] transition-all"
                       >
                         <Target className="w-4 h-4" />
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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
