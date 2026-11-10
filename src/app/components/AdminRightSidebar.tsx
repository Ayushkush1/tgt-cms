import Link from "next/link";

export function AdminRightSidebar() {
  return (
    <>
      {/* Dark Promo Card */}
      <div className="relative overflow-hidden rounded-[2rem] bg-[#0B0F29] p-7 text-white shadow-xl">
        {/* Decorative Bubbles */}
        <div className="absolute top-0 right-0 h-32 w-32 translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 h-24 w-24 -translate-x-1/2 translate-y-1/2 rounded-full bg-[#D4AF37]/10 blur-xl"></div>
        <div className="mb-6 flex items-center gap-2 font-bold tracking-tight text-white/90">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white font-serif text-sm text-[#0B0F29] italic">
            T
          </div>
          TGT Setup
        </div>
        <h2 className="mb-3 text-[26px] leading-[1.1] font-black">
          Optimize <br />
          Performance
        </h2>
        <p className="mb-8 max-w-[200px] text-sm leading-relaxed font-medium text-gray-400">
          Enable advanced analytics and track 25k+ user interactions effortlessly.
        </p>
        <Link
          href="/seo/global"
          className="relative z-10 inline-block transform rounded-full bg-[#D4AF37] px-6 py-2.5 text-sm font-bold text-[#0B0F29] shadow-[0_0_20px_rgba(217,249,105,0.3)] transition-colors hover:scale-105 hover:bg-white"
        >
          Get Access
        </Link>
        {/* Illustration Placeholder */}
        <div className="pointer-events-none absolute right-0 -bottom-4 h-36 w-36 opacity-90">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://api.dicebear.com/7.x/notionists/svg?seed=Illustration&backgroundColor=transparent"
            className="h-full w-full object-contain contrast-125 drop-shadow-2xl grayscale filter"
            alt="illustration"
          />
        </div>
      </div>

      {/* Quick Analytics */}
      <div>
        <div className="mb-4 flex items-center justify-between px-2">
          <h3 className="text-lg font-bold text-[#0B0F29]">Quick Analytics</h3>
          <button className="text-xs font-bold text-[#0B0F29] hover:underline">View All</button>
        </div>

        <div className="space-y-3">
          {/* Metric 1 */}
          <div className="cursor-pointer rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-50 transition-transform hover:-translate-y-0.5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[13px] font-medium text-gray-400">Conversion Rate</span>
              <span className="rounded-md bg-[#12b76a]/10 px-2 py-0.5 text-[11px] font-bold text-[#12b76a]">
                +2.4%
              </span>
            </div>
            <div className="mb-3 flex items-end gap-2">
              <h4 className="text-2xl leading-none font-black text-[#0B0F29]">3.8%</h4>
            </div>
            {/* Mini Progress */}
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div className="h-1.5 rounded-full bg-[#D4AF37]" style={{ width: "65%" }}></div>
            </div>
          </div>

          {/* Metric 2 */}
          <div className="cursor-pointer rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-50 transition-transform hover:-translate-y-0.5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[13px] font-medium text-gray-400">Active Users (Now)</span>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500"></div>
                <span className="text-[11px] font-bold text-gray-400">Live</span>
              </div>
            </div>
            <div className="flex items-end gap-2">
              <h4 className="text-2xl leading-none font-black text-[#0B0F29]">428</h4>
              <span className="pb-0.5 text-[12px] font-bold text-[#12b76a]">↑ 12</span>
            </div>
          </div>

          {/* Metric 3 */}
          <div className="cursor-pointer rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-50 transition-transform hover:-translate-y-0.5">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[13px] font-medium text-gray-400">Bounce Rate</span>
              <span className="rounded-md bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-500">
                +1.2%
              </span>
            </div>
            <div className="mt-1 flex items-end gap-2">
              <h4 className="text-2xl leading-none font-black text-[#0B0F29]">42.3%</h4>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
