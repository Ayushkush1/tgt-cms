import { AdminHeader } from "./components/AdminHeader";
import { OverviewStats } from "./components/OverviewStats";
import { ActivityCharts } from "./components/ActivityCharts";
import { AdminRightSidebar } from "./components/AdminRightSidebar";

export default function Home() {
  return (
    <div className="animate-in fade-in space-y-8 pb-12 duration-500">
      {/* Header Row */}
      <AdminHeader />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Left/Main Content Column (8 cols) */}
        <div className="space-y-6 xl:col-span-8">
          <OverviewStats />
          <ActivityCharts />
        </div>

        {/* Right Sidebar Column (4 cols) */}
        <div className="space-y-6 xl:col-span-4">
          <AdminRightSidebar />
        </div>
      </div>
    </div>
  );
}
