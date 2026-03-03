import { PageHeader } from "@/components/PageHeader";
import AboutFirm from "./components/AboutFirm";
import VideoSection from "./components/VideoSection";
import VisionSection from "./components/VisionSection";
import OurTeam from "./components/OurTeam";
import PortfolioSection from "./components/PortfolioSection";

export default function AboutCMSPage() {
  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title="About Page Content"
        description="Manage the content displayed on the about page."
      />

      {/* Sections */}
      <AboutFirm />
      <VideoSection />
      <VisionSection />
      <OurTeam />
      <PortfolioSection />
    </section>
  );
}
