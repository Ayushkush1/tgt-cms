// Quick helper
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChevronLeft(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

export function AdminRightSidebar() {
  return (
    <>
      {/* Dark Promo Card */}
      <div className="bg-[#0B0F29] rounded-[2rem] p-7 text-white relative overflow-hidden shadow-xl">
        {/* Decorative Bubbles */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#D4AF37]/10 rounded-full blur-xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="flex items-center gap-2 font-bold tracking-tight text-white/90 mb-6">
          <div className="w-6 h-6 rounded-full bg-white text-[#0B0F29] flex items-center justify-center font-serif italic text-sm">
            e
          </div>
          Eduplex Setup
        </div>

        <h2 className="text-[26px] font-black leading-[1.1] mb-3">
          Optimize <br />
          Performance
        </h2>
        <p className="text-sm font-medium text-gray-400 leading-relaxed max-w-[200px] mb-8">
          Enable advanced analytics and track 25k+ user interactions
          effortlessly.
        </p>

        <button className="bg-[#D4AF37] text-[#0B0F29] px-6 py-2.5 rounded-full text-sm font-bold hover:bg-white transition-colors transform hover:scale-105 shadow-[0_0_20px_rgba(217,249,105,0.3)]">
          Get Access
        </button>

        {/* Illustration Placeholder */}
        <div className="absolute -bottom-4 right-0 w-36 h-36 opacity-90 pointer-events-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://api.dicebear.com/7.x/notionists/svg?seed=Illustration&backgroundColor=transparent"
            className="w-full h-full object-contain filter drop-shadow-2xl grayscale contrast-125"
            alt="illustration"
          />
        </div>
      </div>

      {/* Quick Analytics */}
      <div>
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="font-bold text-lg text-[#0B0F29]">Quick Analytics</h3>
          <button className="text-[#0B0F29] text-xs font-bold hover:underline">
            View All
          </button>
        </div>

        <div className="space-y-3">
          {/* Metric 1 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm ring-1 ring-gray-50 hover:-translate-y-0.5 transition-transform cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] font-medium text-gray-400">
                Conversion Rate
              </span>
              <span className="text-[11px] font-bold text-[#12b76a] bg-[#12b76a]/10 px-2 py-0.5 rounded-md">
                +2.4%
              </span>
            </div>
            <div className="flex items-end gap-2 mb-3">
              <h4 className="font-black text-2xl text-[#0B0F29] leading-none">
                3.8%
              </h4>
            </div>
            {/* Mini Progress */}
            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-[#D4AF37] h-1.5 rounded-full"
                style={{ width: "65%" }}
              ></div>
            </div>
          </div>

          {/* Metric 2 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm ring-1 ring-gray-50 hover:-translate-y-0.5 transition-transform cursor-pointer">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] font-medium text-gray-400">
                Active Users (Now)
              </span>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-[11px] font-bold text-gray-400">
                  Live
                </span>
              </div>
            </div>
            <div className="flex items-end gap-2">
              <h4 className="font-black text-2xl text-[#0B0F29] leading-none">
                428
              </h4>
              <span className="text-[12px] font-bold text-[#12b76a] pb-0.5">
                ↑ 12
              </span>
            </div>
          </div>

          {/* Metric 3 */}
          <div className="bg-white rounded-2xl p-4 shadow-sm ring-1 ring-gray-50 hover:-translate-y-0.5 transition-transform cursor-pointer">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[13px] font-medium text-gray-400">
                Bounce Rate
              </span>
              <span className="text-[11px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-md">
                +1.2%
              </span>
            </div>
            <div className="flex items-end gap-2 mt-1">
              <h4 className="font-black text-2xl text-[#0B0F29] leading-none">
                42.3%
              </h4>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
