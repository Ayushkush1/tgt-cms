import { AdminHeader } from "./components/AdminHeader";
import { OverviewStats } from "./components/OverviewStats";
import { ActivityCharts } from "./components/ActivityCharts";
import { AdminRightSidebar } from "./components/AdminRightSidebar";

export default function Home() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header Row */}
      <AdminHeader />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left/Main Content Column (8 cols) */}
        <div className="xl:col-span-8 space-y-6">
          <OverviewStats />
          <ActivityCharts />
        </div>

        {/* Right Sidebar Column (4 cols) */}
        <div className="xl:col-span-4 space-y-6">
          <AdminRightSidebar />
        </div>
      </div>
    </div>
  );
}
