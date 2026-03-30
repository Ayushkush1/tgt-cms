import { ChevronRight, ArrowUpRight } from "lucide-react";

export function ActivityCharts() {
  return (
    <div className="">
      {/* Hours Activity (Mock Chart) */}
      <div className="bg-white rounded-3xl p-6 shadow-sm ring-1 ring-gray-50">
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-bold text-lg text-[#0B0F29]">Site Traffic</h3>
          <div className="px-3 py-1.5 rounded-full border border-gray-200 text-[13px] font-semibold flex items-center gap-2 cursor-pointer hover:bg-gray-50">
            Weekly <ChevronRight className="w-3.5 h-3.5 translate-y-px" />
          </div>
        </div>
        <div className="flex items-center gap-2 mb-8">
          <ArrowUpRight className="w-4 h-4 text-[#12b76a]" strokeWidth={3} />
          <span className="text-[#12b76a] font-bold text-sm">+3%</span>
          <span className="text-gray-400 font-medium text-sm">
            Increase than last week
          </span>
        </div>

        <div className="h-[180px] w-full flex items-end justify-between px-2 pb-6 relative">
          {/* Y Axis */}
          <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[11px] font-bold text-gray-300">
            <span>8k</span>
            <span>6k</span>
            <span>4k</span>
            <span>2k</span>
            <span>1k</span>
          </div>
          {/* Bars */}
          <div className="ml-8 w-full flex items-end justify-between h-full group relative">
            <div className="w-5 h-[40%] bg-[#0B0F29] rounded-full hover:bg-[#D4AF37] transition-colors"></div>
            <div className="w-5 h-[65%] bg-[#0B0F29] rounded-full hover:bg-[#D4AF37] transition-colors"></div>
            <div className="w-5 h-[30%] bg-[#0B0F29] rounded-full hover:bg-[#D4AF37] transition-colors"></div>

            {/* Highlighted Tooltip Bar */}
            <div className="relative h-full flex items-end justify-center w-5">
              <div className="w-full h-[90%] bg-[#D4AF37] rounded-full"></div>
              {/* Tooltip */}
              <div className="absolute -top-12 bg-[#0B0F29] text-white text-[11px] font-semibold px-3 py-2 rounded-lg whitespace-nowrap shadow-xl z-10 before:absolute before:-bottom-1 before:left-1/2 before:-translate-x-1/2 before:w-2 before:h-2 before:bg-[#0B0F29] before:rotate-45">
                <div className="flex items-center gap-2">
                  <span>👩‍💻 6.4k views</span>
                  <span className="text-gray-400 font-normal border-l border-gray-600 pl-2">
                    26 Oct
                  </span>
                </div>
              </div>
            </div>

            <div className="w-5 h-[55%] bg-[#0B0F29] rounded-full hover:bg-[#D4AF37] transition-colors"></div>
            <div className="w-5 h-[50%] bg-[#0B0F29] rounded-full hover:bg-[#D4AF37] transition-colors"></div>
          </div>

          {/* X Axis */}
          <div className="absolute bottom-0 ml-8 w-[calc(100%-2rem)] flex justify-between text-[12px] font-bold text-gray-400 pt-3 border-t border-gray-100">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>
        </div>
      </div>
    </div>
  );
}
