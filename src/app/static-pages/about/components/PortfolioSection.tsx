"use client";
import { useState } from "react";
import { InputField } from "@/components/InputField";
import { SaveButton } from "@/components/SaveButton";
import { SectionHeader } from "@/components/SectionHeader";
import { TextAreaField } from "@/components/TextAreaField";
import { ImageUploadField } from "@/components/ImageUploadField";

export default function PortfolioSection() {
  const [isOpen, setIsOpen] = useState(false);

  // Simulated portfolio data
  const [portfolios, setPortfolios] = useState([
    {
      id: 1,
      title: "GreatWaterFilters.com.au",
      subtitle: "Website Development",
      CTA: "Water Purifier",
      link: "#",
      date: "Tue, 8 Mar 2022",
      description:
        "A full e-commerce and content website for Australia's water filter specialists.",
      image: "/images/portfolioImg1.jpg",
    },
    {
      id: 2,
      title: "MyWeekendTrip",
      subtitle: "Website Development",
      CTA: "Tourism",
      link: "#",
      date: "Mon, 14 Nov 2023",
      description: "A booking and discovery platform for weekend getaways.",
      image: "/images/portfolioImg2.jpg",
    },
  ]);

  return (
    <section>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4 transition-all">
        <SectionHeader
          title="Portfolio Carousel Section"
          description="Manage the portfolio projects shown in the interactive swiper."
          isOpen={isOpen}
          onToggle={() => setIsOpen(!isOpen)}
        />

        <div
          className={`grid transition-all duration-300 ease-in-out ${
            isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="col-span-2">
                <div className="flex justify-between items-center mb-4">
                  <h1 className="text-base font-bold text-gray-500">
                    Portfolio Projects
                  </h1>
                  <button
                    onClick={() =>
                      setPortfolios([
                        ...portfolios,
                        {
                          id: Date.now(),
                          title: "New Project",
                          subtitle: "Category",
                          CTA: "Industry",
                          link: "#",
                          date: new Date().toLocaleDateString(),
                          description: "",
                          image: "",
                        },
                      ])
                    }
                    className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 py-1 px-3 rounded-lg font-medium transition-colors"
                  >
                    + Add Project
                  </button>
                </div>

                <div className="flex flex-col gap-6">
                  {portfolios.map((project, idx) => (
                    <div
                      key={project.id}
                      className="p-5 border border-gray-200 rounded-xl bg-gray-50 flex flex-col gap-4"
                    >
                      {/* Project Header */}
                      <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                        <h3 className="font-semibold text-gray-700">
                          Project #{idx + 1}
                        </h3>
                        <button
                          onClick={() => {
                            const newPortfolios = [...portfolios];
                            newPortfolios.splice(idx, 1);
                            setPortfolios(newPortfolios);
                          }}
                          className="text-red-500 text-sm font-medium hover:text-red-700"
                        >
                          Remove Project
                        </button>
                      </div>

                      {/* Project Form Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <InputField
                          label="Project Title"
                          defaultValue={project.title}
                        />
                        <InputField
                          label="Subtitle / Category"
                          defaultValue={project.subtitle}
                        />

                        <InputField
                          label="CTA Label / Industry"
                          defaultValue={project.CTA}
                        />
                        <InputField
                          label="Project Link"
                          defaultValue={project.link}
                        />

                        <InputField label="Date" defaultValue={project.date} />

                        <TextAreaField
                          label="Short Description"
                          defaultValue={project.description}
                          containerClassName="col-span-2"
                        />

                        <div className="col-span-2">
                          <ImageUploadField label="Cover Image" />
                        </div>

                        {/* Note: the nested stats/services arrays could be built out recursively here, 
                            but keeping it one level deep for this CMS block unless requested. */}
                        <div className="col-span-2 p-3 bg-blue-50/50 rounded-lg text-sm text-blue-600 border border-blue-100">
                          <strong>Note:</strong> Stats and inner services
                          features are currently managed in code. Let me know if
                          you need full deep-nested CMS controls for them!
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="col-span-2 mt-4">
                <SaveButton />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
