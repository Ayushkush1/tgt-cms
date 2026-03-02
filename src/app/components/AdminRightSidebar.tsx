import { ChevronRight, Plus } from "lucide-react";

// Quick helper
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
          <img
            src="https://api.dicebear.com/7.x/notionists/svg?seed=Illustration&backgroundColor=transparent"
            className="w-full h-full object-contain filter drop-shadow-2xl grayscale contrast-125"
            alt="illustration"
          />
        </div>
      </div>

      {/* Calendar Box */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm ring-1 ring-gray-50 flex flex-col items-center">
        <div className="flex items-center justify-between w-full mb-6 px-2">
          <ChevronLeft className="w-5 h-5 text-gray-400 cursor-pointer hover:text-[#0B0F29]" />
          <span className="font-bold text-[15px] text-[#0B0F29]">
            October, 2026
          </span>
          <ChevronRight className="w-5 h-5 text-gray-400 cursor-pointer hover:text-[#0B0F29]" />
        </div>

        <div className="grid grid-cols-7 w-full gap-y-4 gap-x-1 text-center text-[12px]">
          {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
            <div
              key={d}
              className="font-bold text-gray-400 tracking-wider mb-2"
            >
              {d}
            </div>
          ))}

          {/* Dummy Dates */}
          <div className="text-gray-300 font-medium p-1">28</div>
          <div className="text-gray-300 font-medium p-1">29</div>
          <div className="text-gray-300 font-medium p-1">30</div>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map((d) => (
            <div
              key={d}
              className="text-[#0B0F29] font-semibold p-1 cursor-pointer hover:bg-gray-50 rounded-full"
            >
              {d}
            </div>
          ))}
          <div className="text-[#0B0F29] font-semibold bg-[#D4AF37] rounded-full w-8 h-8 flex items-center justify-center mx-auto shadow-sm cursor-pointer">
            17
          </div>
          {[18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31].map((d) => (
            <div
              key={d}
              className="text-[#0B0F29] font-semibold p-1 cursor-pointer hover:bg-gray-50 rounded-full"
            >
              {d}
            </div>
          ))}
        </div>
      </div>

      {/* Tasks/Assignments */}
      <div>
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="font-bold text-lg text-[#0B0F29]">Action Items</h3>
          <button className="w-6 h-6 rounded-full bg-[#D4AF37] text-[#0B0F29] flex items-center justify-center hover:scale-105 transition-transform">
            <Plus className="w-4 h-4" strokeWidth={3} />
          </button>
        </div>

        <div className="space-y-3">
          {[
            {
              title: "Review New Copy",
              date: "02 Oct, 10:30 AM",
              status: "In progress",
              color: "bg-indigo-100 text-indigo-700",
              icon: "📝",
              iconBg: "bg-indigo-50",
            },
            {
              title: "Client Feedback",
              date: "14 Oct, 12:45 AM",
              status: "Completed",
              color: "bg-[#d1fadf] text-[#027a48]",
              icon: "✅",
              iconBg: "bg-green-50",
            },
            {
              title: "Data Collection",
              date: "22 Oct, 11:00 AM",
              status: "Upcoming",
              color: "bg-orange-100 text-orange-700",
              icon: "📊",
              iconBg: "bg-orange-50",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-4 shadow-sm ring-1 ring-gray-50 flex items-center justify-between hover:-translate-y-0.5 transition-transform cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl ${item.iconBg} flex items-center justify-center text-lg`}
                >
                  {item.icon}
                </div>
                <div>
                  <h4 className="font-bold text-[14px] text-[#0B0F29] leading-tight">
                    {item.title}
                  </h4>
                  <p className="text-[12px] font-medium text-gray-400 mt-1">
                    {item.date}
                  </p>
                </div>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${item.color}`}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
