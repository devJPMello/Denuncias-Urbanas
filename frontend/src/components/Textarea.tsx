import { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function Textarea({ label, className = '', ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="font-semibold text-gray-900">{label}</label>}
      <textarea
        className={`px-4 py-4 rounded-2xl bg-white border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-h-[120px] transition-all resize-none ${className}`}
        {...props}
      />
    </div>
  );
}
