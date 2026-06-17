"use client";

import { InputField } from "@/app/components/InputField";
import { TextAreaField } from "@/app/components/TextAreaField";
import { Plus, Trash2, GripVertical } from "lucide-react";

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
  const handleMilestoneChange = (idx: number, key: keyof CeoTimelineMilestone, val: string) => {
    const newMilestones = [...timeline.milestones];
    newMilestones[idx] = { ...newMilestones[idx], [key]: val };
    onTimelineChange({ ...timeline, milestones: newMilestones });
  };

  const addMilestone = () => {
    const newMilestones = [...timeline.milestones, { year: "", title: "", description: "" }];
    onTimelineChange({ ...timeline, milestones: newMilestones });
  };

  const removeMilestone = (idx: number) => {
    const newMilestones = timeline.milestones.filter((_, i) => i !== idx);
    onTimelineChange({ ...timeline, milestones: newMilestones });
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-6">CEO Timeline/Milestones Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="Timeline Upper Tag"
            value={timeline.upperTag}
            onChange={(e) => onTimelineChange({ ...timeline, upperTag: e.target.value })}
            placeholder="e.g. Milestones"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:col-span-2">
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
        <div className="flex justify-between items-center mt-8 mb-6 ml-2">
          <h4 className="text-sm font-bold text-gray-700 uppercase tracking-widest">Milestones Timeline</h4>
          <button
            onClick={addMilestone}
            className="px-4 py-2 bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Milestone
          </button>
        </div>

        <div className="flex flex-col gap-6">
          {timeline.milestones.map((item, idx) => (
            <div key={idx} className="border border-gray-100 rounded-3xl p-6 bg-gray-50/30 relative group shadow-sm transition-all hover:shadow-md">
              <button
                onClick={() => removeMilestone(idx)}
                className="absolute top-6 right-6 text-red-500 hover:bg-red-50 p-2 rounded-2xl transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                <div className="md:col-span-2 flex items-center gap-2">
                  <GripVertical className="text-gray-300 w-4 h-4 cursor-grab" />
                  <InputField
                    label="Year"
                    value={item.year}
                    onChange={(e) => handleMilestoneChange(idx, "year", e.target.value)}
                    placeholder="e.g. 2015"
                  />
                </div>
                <div className="md:col-span-10">
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
            </div>
          ))}
          {timeline.milestones.length === 0 && (
            <div className="py-10 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-3xl text-sm">
              No milestones added yet. Click "Add Milestone" to start.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
