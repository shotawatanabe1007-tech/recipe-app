import { useRef } from 'react';

interface Props {
  onImageSelect: (base64: string, mediaType: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif') => void;
  preview?: string;
  label?: string;
}

export default function ImageUploader({ onImageSelect, preview, label = '画像をアップロード' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const mediaType = file.type as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      // strip data URL prefix
      const base64 = result.split(',')[1];
      onImageSelect(base64, mediaType);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleFile(file);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => inputRef.current?.click()}
      className="border-2 border-dashed border-gray-300 rounded-xl p-4 cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors text-center"
    >
      {preview ? (
        <img
          src={`data:image/jpeg;base64,${preview}`}
          alt="preview"
          className="max-h-48 mx-auto rounded-lg object-contain"
        />
      ) : (
        <div className="py-6">
          <div className="text-4xl mb-2">📷</div>
          <p className="text-gray-500 text-sm">{label}</p>
          <p className="text-gray-400 text-xs mt-1">クリックまたはドラッグ＆ドロップ</p>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}
