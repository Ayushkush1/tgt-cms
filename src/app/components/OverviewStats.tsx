"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Star, MessageSquare, Activity, Zap } from "lucide-react";

export function OverviewStats() {
  const [stats, setStats] = useState({
    services: 0,
    enquiries: 0,
    blogs: 0,
    audits: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/dashboard/stats");
        const json = await res.json();
        if (json.success) {
          setStats(json.data);
        }
      } catch (error) {
        console.error("Dashboard stats fetch error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[#0B0F29]">Overview Stats</h2>
        <Link
          href="/submissions/enquiries"
          className="text-sm font-semibold text-gray-500 hover:text-[#0B0F29] underline decoration-gray-300 underline-offset-4 transition-colors"
        >
          View All
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Stat Card 1: Audits */}
        <div className="bg-white rounded-3xl p-5 shadow-sm ring-1 ring-gray-50 hover:-translate-y-1 transition-transform duration-300">
          <div className="flex items-start gap-4 mb-6">
            <div className="h-12 w-12 rounded-2xl bg-[#f0f9ff] text-[#0ea5e9] flex items-center justify-center">
              <Zap className="w-6 h-6" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="font-bold text-[#0B0F29] text-[15px]">
                Audit Requests
              </h3>
              <p className="text-[13px] font-medium text-gray-400 mt-0.5">
                {loading ? "..." : `${stats.audits} Inbound`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-50">
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Status
              </p>
              <p className="text-[13px] font-bold text-[#0b0f29]">Active</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Source
              </p>
              <p className="text-[13px] font-bold text-[#0B0F29]">Audit Form</p>
            </div>
          </div>
        </div>

        {/* Stat Card 2: Enquiries */}
        <div className="bg-white rounded-3xl p-5 shadow-sm ring-1 ring-gray-50 hover:-translate-y-1 transition-transform duration-300">
          <div className="flex items-start gap-4 mb-6">
            <div className="h-12 w-12 rounded-2xl bg-[#d1fadf] text-[#12b76a] flex items-center justify-center">
              <MessageSquare className="w-6 h-6" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="font-bold text-[#0B0F29] text-[15px]">
                Enquiries
              </h3>
              <p className="text-[13px] font-medium text-gray-400 mt-0.5">
                {loading ? "..." : `${stats.enquiries} Submissions`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-50">
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Response
              </p>
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                <span className="text-[13px] font-bold text-[#0B0F29]">
                  In Scope
                </span>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Source
              </p>
              <p className="text-[13px] font-bold text-[#0B0F29]">Organic</p>
            </div>
          </div>
        </div>

        {/* Stat Card 4: Blog Posts */}
        <div className="bg-white rounded-3xl p-5 shadow-sm ring-1 ring-gray-50 hover:-translate-y-1 transition-transform duration-300">
          <div className="flex items-start gap-4 mb-6">
            <div className="h-12 w-12 rounded-2xl bg-[#ebe9fe] text-[#7a5af8] flex items-center justify-center">
              <Activity className="w-6 h-6" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="font-bold text-[#0B0F29] text-[15px]">
                Blog Posts
              </h3>
              <p className="text-[13px] font-medium text-gray-400 mt-0.5">
                {loading ? "..." : `${stats.blogs} Published`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-50">
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Views
              </p>
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                <span className="text-[13px] font-bold text-[#0B0F29]">
                  +2.4k
                </span>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Type
              </p>
              <p className="text-[13px] font-bold text-[#0B0F29]">Tech Focus</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
