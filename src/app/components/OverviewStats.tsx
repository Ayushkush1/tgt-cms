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
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#0B0F29]">Overview Stats</h2>
        <Link
          href="/submissions/enquiries"
          className="text-sm font-semibold text-gray-500 underline decoration-gray-300 underline-offset-4 transition-colors hover:text-[#0B0F29]"
        >
          View All
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Stat Card 1: Audits */}
        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-50 transition-transform duration-300 hover:-translate-y-1">
          <div className="mb-6 flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f0f9ff] text-[#0ea5e9]">
              <Zap className="h-6 w-6" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-[#0B0F29]">Audit Requests</h3>
              <p className="mt-0.5 text-[13px] font-medium text-gray-400">
                {loading ? "..." : `${stats.audits} Inbound`}
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-6 border-t border-gray-50 pt-4">
            <div>
              <p className="mb-1 text-[11px] font-bold tracking-wider text-gray-400 uppercase">
                Status
              </p>
              <p className="text-[13px] font-bold text-[#0b0f29]">Active</p>
            </div>
            <div>
              <p className="mb-1 text-[11px] font-bold tracking-wider text-gray-400 uppercase">
                Source
              </p>
              <p className="text-[13px] font-bold text-[#0B0F29]">Audit Form</p>
            </div>
          </div>
        </div>

        {/* Stat Card 2: Enquiries */}
        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-50 transition-transform duration-300 hover:-translate-y-1">
          <div className="mb-6 flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d1fadf] text-[#12b76a]">
              <MessageSquare className="h-6 w-6" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-[#0B0F29]">Enquiries</h3>
              <p className="mt-0.5 text-[13px] font-medium text-gray-400">
                {loading ? "..." : `${stats.enquiries} Submissions`}
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-6 border-t border-gray-50 pt-4">
            <div>
              <p className="mb-1 text-[11px] font-bold tracking-wider text-gray-400 uppercase">
                Response
              </p>
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                <span className="text-[13px] font-bold text-[#0B0F29]">In Scope</span>
              </div>
            </div>
            <div>
              <p className="mb-1 text-[11px] font-bold tracking-wider text-gray-400 uppercase">
                Source
              </p>
              <p className="text-[13px] font-bold text-[#0B0F29]">Organic</p>
            </div>
          </div>
        </div>

        {/* Stat Card 4: Blog Posts */}
        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-50 transition-transform duration-300 hover:-translate-y-1">
          <div className="mb-6 flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ebe9fe] text-[#7a5af8]">
              <Activity className="h-6 w-6" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-[#0B0F29]">Blog Posts</h3>
              <p className="mt-0.5 text-[13px] font-medium text-gray-400">
                {loading ? "..." : `${stats.blogs} Published`}
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-6 border-t border-gray-50 pt-4">
            <div>
              <p className="mb-1 text-[11px] font-bold tracking-wider text-gray-400 uppercase">
                Views
              </p>
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                <span className="text-[13px] font-bold text-[#0B0F29]">+2.4k</span>
              </div>
            </div>
            <div>
              <p className="mb-1 text-[11px] font-bold tracking-wider text-gray-400 uppercase">
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
