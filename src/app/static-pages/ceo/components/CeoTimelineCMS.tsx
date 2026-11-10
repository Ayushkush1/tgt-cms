"use client";

import { useState } from "react";
import { InputField } from "@/app/components/InputField";
import { TextAreaField } from "@/app/components/TextAreaField";
import { CollapsibleCard } from "@/app/components/CollapsibleCard";
import { Plus } from "lucide-react";

export interface CeoTimelineMilestone {
  year: string;
  title: string;
  description: string;
}

export interface CeoTimelineData {
  upperTag: string;
  title: string;
  titleHighlight: string;
  description: string;
  milestones: CeoTimelineMilestone[];
}

interface Props {
  timeline: CeoTimelineData;
  onTimelineChange: (timeline: CeoTimelineData) => void;
}

export function CeoTimelineCMS({ timeline, onTimelineChange }: Props) {
  const [expandedMilestone, setExpandedMilestone] = useState<number | null>(null);

  const handleMilestoneChange = (idx: number, key: keyof CeoTimelineMilestone, val: string) => {
    const newMilestones = [...timeline.milestones];
    newMilestones[idx] = { ...newMilestones[idx], [key]: val };
    onTimelineChange({ ...timeline, milestones: newMilestones });
  };

  const addMilestone = () => {
    const newMilestones = [...timeline.milestones, { year: "", title: "", description: "" }];
    onTimelineChange({ ...timeline, milestones: newMilestones });
    setExpandedMilestone(timeline.milestones.length);
  };

  const removeMilestone = (idx: number) => {
    const newMilestones = timeline.milestones.filter((_, i) => i !== idx);
    onTimelineChange({ ...timeline, milestones: newMilestones });
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-6 text-lg font-bold text-gray-800">CEO Timeline/Milestones Settings</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <InputField
            label="Timeline Upper Tag"
            value={timeline.upperTag}
            onChange={(e) => onTimelineChange({ ...timeline, upperTag: e.target.value })}
            placeholder="e.g. Milestones"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:col-span-2">
            <InputField
              label="Timeline Title"
              value={timeline.title}
              onChange={(e) => onTimelineChange({ ...timeline, title: e.target.value })}
              placeholder="e.g. Journey of"
            />
            <InputField
              label="Timeline Title Highlight"
              value={timeline.titleHighlight}
              onChange={(e) => onTimelineChange({ ...timeline, titleHighlight: e.target.value })}
              placeholder="e.g. Excellence"
            />
          </div>
          <TextAreaField
            label="Timeline Section Subtitle"
            value={timeline.description}
            onChange={(e) => onTimelineChange({ ...timeline, description: e.target.value })}
            placeholder="Enter timeline description..."
            containerClassName="md:col-span-2"
            rows={3}
          />
        </div>

        {/* Milestones List */}
        <div className="mt-8 mb-6 ml-2 flex items-center justify-between">
          <h4 className="text-sm font-bold tracking-widest text-gray-700 uppercase">
            Milestones Timeline
          </h4>
          <button
            onClick={addMilestone}
            className="flex items-center gap-2 rounded-xl bg-[#D4AF37]/10 px-4 py-2 text-xs font-bold text-[#D4AF37] transition-all hover:bg-[#D4AF37] hover:text-white"
          >
            <Plus className="h-4 w-4" /> Add Milestone
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {timeline.milestones.map((item, idx) => (
            <CollapsibleCard
              key={idx}
              badge={item.year || `(${String(idx + 1).padStart(2, "0")})`}
              title={item.title || `Milestone #${idx + 1}`}
              isOpen={expandedMilestone === idx}
              onToggle={() => setExpandedMilestone(expandedMilestone === idx ? null : idx)}
              onRemove={() => removeMilestone(idx)}
            >
              <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-12">
                <div className="md:col-span-3">
                  <InputField
                    label="Year"
                    value={item.year}
                    onChange={(e) => handleMilestoneChange(idx, "year", e.target.value)}
                    placeholder="e.g. 2015"
                  />
                </div>
                <div className="md:col-span-9">
                  <InputField
                    label="Milestone Title"
                    value={item.title}
                    onChange={(e) => handleMilestoneChange(idx, "title", e.target.value)}
                    placeholder="e.g. The Foundation"
                  />
                </div>
                <div className="md:col-span-12">
                  <TextAreaField
                    label="Milestone Description"
                    value={item.description}
                    onChange={(e) => handleMilestoneChange(idx, "description", e.target.value)}
                    placeholder="Describe this milestone achievement..."
                    rows={2}
                  />
                </div>
              </div>
            </CollapsibleCard>
          ))}
          {timeline.milestones.length === 0 && (
            <div className="rounded-3xl border-2 border-dashed border-gray-200 py-10 text-center text-sm text-gray-400">
              No milestones added yet. Click &ldquo;Add Milestone&rdquo; to start.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
