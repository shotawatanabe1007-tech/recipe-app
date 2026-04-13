interface Props {
  value: number;
  onChange?: (v: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

export default function StarRating({ value, onChange, size = 'md' }: Props) {
  const sizeClass = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-3xl' : 'text-2xl';

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          className={`${sizeClass} ${onChange ? 'cursor-pointer' : 'cursor-default'} transition-transform ${onChange ? 'hover:scale-110' : ''}`}
          disabled={!onChange}
        >
          {star <= value ? '★' : '☆'}
        </button>
      ))}
    </div>
  );
}
