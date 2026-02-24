import { format, addMonths, subMonths } from 'date-fns';

interface MonthPickerProps {
  value: Date;
  onChange: (date: Date) => void;
}

export default function MonthPicker({ value, onChange }: MonthPickerProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(subMonths(value, 1))}
        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 font-bold"
      >
        ‹
      </button>
      <span className="text-sm font-semibold text-gray-700 min-w-[120px] text-center">
        {format(value, 'MMMM yyyy')}
      </span>
      <button
        onClick={() => onChange(addMonths(value, 1))}
        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 font-bold"
      >
        ›
      </button>
    </div>
  );
}
