import { ChevronRight, Plus } from "lucide-react";

export function ContentPipeline() {
    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#0B0F29]">Content Publishing Pipeline</h2>
                <div className="flex items-center gap-2">
                    <div className="px-3 py-1.5 rounded-full border border-gray-200 text-[13px] font-semibold flex items-center gap-2 cursor-pointer hover:bg-gray-50">
                        Active <ChevronRight className="w-3.5 h-3.5 translate-y-[1px]" />
                    </div>
                    <button className="w-8 h-8 rounded-full bg-[#D4AF37] text-[#0B0F29] flex items-center justify-center hover:scale-105 transition-transform">
                        <Plus className="w-5 h-5" strokeWidth={3} />
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                {[
                    { title: "Q4 Marketing Strategy", author: "Sarah Jenkins", remaining: "8h 45 min", progress: 45, color: "text-purple-500", icon: "bg-purple-100" },
                    { title: "Development Basics", author: "Mike Ross", remaining: "18h 12 min", progress: 75, color: "text-green-500", icon: "bg-green-100" },
                ].map((item, i) => (
                    <div key={i} className="bg-white rounded-2xl p-4 shadow-sm ring-1 ring-gray-50 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl ${item.icon} flex items-center justify-center`}>
                                <div className={`w-6 h-6 rounded border-2 border-current ${item.color} flex items-center justify-center opacity-70`}></div>
                            </div>
                            <div>
                                <h4 className="font-bold text-[15px] text-[#0B0F29]">{item.title}</h4>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <div className="w-4 h-4 bg-gray-200 rounded-full overflow-hidden">
                                        <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${item.author}`} />
                                    </div>
                                    <p className="text-[12px] font-medium text-gray-500">{item.author}</p>
                                </div>
                            </div>
                        </div>

                        <div className="hidden sm:block">
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Time to Pub</p>
                            <p className="text-[13px] font-bold text-[#0B0F29]">{item.remaining}</p>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Fake Circle Progress */}
                            <svg className="w-8 h-8 transform -rotate-90">
                                <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-gray-100" />
                                <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="3" fill="transparent" strokeDasharray={`${item.progress} 100`} className={item.color} />
                            </svg>
                            <span className="text-[14px] font-bold text-[#0B0F29] min-w-[32px]">{item.progress}%</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
