import { ChevronRight, ArrowUpRight } from "lucide-react";

export function ActivityCharts() {
  return (
    <div className="">
      {/* Hours Activity (Mock Chart) */}
      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-50">
        <div className="mb-8 flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#0B0F29]">Site Traffic</h3>
          <div className="flex cursor-pointer items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-[13px] font-semibold hover:bg-gray-50">
            Weekly <ChevronRight className="h-3.5 w-3.5 translate-y-px" />
          </div>
        </div>
        <div className="mb-8 flex items-center gap-2">
          <ArrowUpRight className="h-4 w-4 text-[#12b76a]" strokeWidth={3} />
          <span className="text-sm font-bold text-[#12b76a]">+3%</span>
          <span className="text-sm font-medium text-gray-400">Increase than last week</span>
        </div>

        <div className="relative flex h-[180px] w-full items-end justify-between px-2 pb-6">
          {/* Y Axis */}
          <div className="absolute top-0 bottom-6 left-0 flex flex-col justify-between text-[11px] font-bold text-gray-300">
            <span>8k</span>
            <span>6k</span>
            <span>4k</span>
            <span>2k</span>
            <span>1k</span>
          </div>
          {/* Bars */}
          <div className="group relative ml-8 flex h-full w-full items-end justify-between">
            <div className="h-[40%] w-5 rounded-full bg-[#0B0F29] transition-colors hover:bg-[#D4AF37]"></div>
            <div className="h-[65%] w-5 rounded-full bg-[#0B0F29] transition-colors hover:bg-[#D4AF37]"></div>
            <div className="h-[30%] w-5 rounded-full bg-[#0B0F29] transition-colors hover:bg-[#D4AF37]"></div>

            {/* Highlighted Tooltip Bar */}
            <div className="relative flex h-full w-5 items-end justify-center">
              <div className="h-[90%] w-full rounded-full bg-[#D4AF37]"></div>
              {/* Tooltip */}
              <div className="absolute -top-12 z-10 rounded-lg bg-[#0B0F29] px-3 py-2 text-[11px] font-semibold whitespace-nowrap text-white shadow-xl before:absolute before:-bottom-1 before:left-1/2 before:h-2 before:w-2 before:-translate-x-1/2 before:rotate-45 before:bg-[#0B0F29]">
                <div className="flex items-center gap-2">
                  <span>👩‍💻 6.4k views</span>
                  <span className="border-l border-gray-600 pl-2 font-normal text-gray-400">
                    26 Oct
                  </span>
                </div>
              </div>
            </div>

            <div className="h-[55%] w-5 rounded-full bg-[#0B0F29] transition-colors hover:bg-[#D4AF37]"></div>
            <div className="h-[50%] w-5 rounded-full bg-[#0B0F29] transition-colors hover:bg-[#D4AF37]"></div>
          </div>

          {/* X Axis */}
          <div className="absolute bottom-0 ml-8 flex w-[calc(100%-2rem)] justify-between border-t border-gray-100 pt-3 text-[12px] font-bold text-gray-400">
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
