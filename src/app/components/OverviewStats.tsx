import { BookOpen, Star, MessageSquare, Activity } from "lucide-react";

export function OverviewStats() {
    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#0B0F29]">Overview Stats</h2>
                <button className="text-sm font-semibold text-gray-500 hover:text-[#0B0F29] underline decoration-gray-300 underline-offset-4 transition-colors">
                    View All
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {/* Stat Card 1 */}
                <div className="bg-white rounded-3xl p-5 shadow-sm ring-1 ring-gray-50 hover:-translate-y-1 transition-transform duration-300">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="h-12 w-12 rounded-2xl bg-[#fee4e2] text-[#f04438] flex items-center justify-center">
                            <BookOpen className="w-6 h-6" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#0B0F29] text-[15px]">Services</h3>
                            <p className="text-[13px] font-medium text-gray-400 mt-0.5">12 Active</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-50">
                        <div>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Growth</p>
                            <div className="flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                                <span className="text-[13px] font-bold text-[#0B0F29]">+4.8%</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Category</p>
                            <p className="text-[13px] font-bold text-[#0B0F29]">Core Web</p>
                        </div>
                    </div>
                </div>

                {/* Stat Card 2 */}
                <div className="bg-white rounded-3xl p-5 shadow-sm ring-1 ring-gray-50 hover:-translate-y-1 transition-transform duration-300">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="h-12 w-12 rounded-2xl bg-[#d1fadf] text-[#12b76a] flex items-center justify-center">
                            <MessageSquare className="w-6 h-6" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#0B0F29] text-[15px]">Enquiries</h3>
                            <p className="text-[13px] font-medium text-gray-400 mt-0.5">15 Unread</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-50">
                        <div>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Response</p>
                            <div className="flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                                <span className="text-[13px] font-bold text-[#0B0F29]">In Scope</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Source</p>
                            <p className="text-[13px] font-bold text-[#0B0F29]">Organic</p>
                        </div>
                    </div>
                </div>

                {/* Stat Card 3 */}
                <div className="bg-white rounded-3xl p-5 shadow-sm ring-1 ring-gray-50 hover:-translate-y-1 transition-transform duration-300">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="h-12 w-12 rounded-2xl bg-[#ebe9fe] text-[#7a5af8] flex items-center justify-center">
                            <Activity className="w-6 h-6" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#0B0F29] text-[15px]">Blog Posts</h3>
                            <p className="text-[13px] font-medium text-gray-400 mt-0.5">8 Published</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-50">
                        <div>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Views</p>
                            <div className="flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                                <span className="text-[13px] font-bold text-[#0B0F29]">+2.4k</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Type</p>
                            <p className="text-[13px] font-bold text-[#0B0F29]">Tech Focus</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
