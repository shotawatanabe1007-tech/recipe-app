const STEP_NUMBERS = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩', '⑪', '⑫', '⑬', '⑭', '⑮'];

interface Props {
  steps: string[];
  onChange: (steps: string[]) => void;
}

export default function StepEditor({ steps, onChange }: Props) {
  const update = (idx: number, value: string) => {
    const next = [...steps];
    next[idx] = value;
    onChange(next);
  };

  const addStep = () => onChange([...steps, '']);

  const removeStep = (idx: number) => {
    const next = steps.filter((_, i) => i !== idx);
    onChange(next.length > 0 ? next : ['']);
  };

  return (
    <div className="space-y-2">
      {steps.map((step, idx) => (
        <div key={idx} className="flex items-start gap-2">
          <span className="text-orange-500 font-bold text-lg w-6 shrink-0 mt-1">
            {STEP_NUMBERS[idx] ?? `${idx + 1}`}
          </span>
          <textarea
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-300"
            rows={2}
            value={step}
            onChange={(e) => update(idx, e.target.value)}
            placeholder={`手順 ${idx + 1}`}
          />
          {steps.length > 1 && (
            <button
              type="button"
              onClick={() => removeStep(idx)}
              className="text-gray-400 hover:text-red-400 mt-1 shrink-0"
            >
              ✕
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={addStep}
        className="text-sm text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1"
      >
        ＋ 手順を追加
      </button>
    </div>
  );
}
