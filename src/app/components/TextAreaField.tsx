import { HelpCircle } from "lucide-react";

interface TextAreaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  containerClassName?: string;
  tooltip?: string;
}

export const TextAreaField: React.FC<TextAreaFieldProps> = ({
  label,
  containerClassName = "",
  className = "",
  rows = 4,
  tooltip,
  ...props
}) => {
  const textareaClass = `w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:outline-none focus:border-[#0A0F29] focus:ring-1 focus:ring-[#0A0F29] outline-none transition-all text-gray-800 ${className}`;

  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName} px-0.5`}>
      {label && (
        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-4 flex items-center gap-1.5 relative">
          {label}
          {tooltip && (
            <div className="group relative flex items-center">
              <HelpCircle className="w-3.5 h-3.5 cursor-help text-gray-300 hover:text-[#D4AF37] transition-colors" />
              {/* Tooltip Bubble */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-max max-w-[280px] px-4 py-3 bg-white text-gray-900 text-[11px] font-medium rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-50 normal-case tracking-normal text-center leading-relaxed backdrop-blur-sm">
                {tooltip}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-white"></div>
              </div>
            </div>
          )}
        </label>
      )}
      <textarea rows={rows} className={textareaClass} {...props} />
    </div>
  );
};
