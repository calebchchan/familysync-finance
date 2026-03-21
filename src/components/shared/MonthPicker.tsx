import { format, addMonths, subMonths } from 'date-fns';

interface MonthPickerProps {
  value: Date;
  onChange: (date: Date) => void;
}

export default function MonthPicker({ value, onChange }: MonthPickerProps) {
  return (
    <div className="flex items-center justify-center gap-4 w-full">
      <button
        onClick={() => onChange(subMonths(value, 1))}
        className="w-8 h-8 flex items-center justify-center text-dark-muted hover:text-dark-text"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
      </button>
      <span className="text-base font-semibold text-dark-text min-w-[120px] text-center">
        {format(value, 'MMM yyyy')}
      </span>
      <button
        onClick={() => onChange(addMonths(value, 1))}
        className="w-8 h-8 flex items-center justify-center text-dark-muted hover:text-dark-text"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  );
}
