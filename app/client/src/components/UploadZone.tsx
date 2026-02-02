import { useCallback, useRef, useState } from "react";

type UploadZoneProps = {
  onFileSelect?: (file: File) => void;
  accept?: string;
};

export function UploadZone({ onFileSelect, accept = "image/*" }: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file?.type.startsWith("image/")) {
        onFileSelect?.(file);
      }
    },
    [onFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFileSelect?.(file);
    },
    [onFileSelect]
  );

  const handleClick = () => inputRef.current?.click();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
      <label
        className={`flex min-h-[120px] flex-1 cursor-pointer flex-col justify-center rounded-2xl border-2 border-dashed px-6 py-8 transition-colors ${
          isDragOver
            ? "border-foreground bg-primary/10"
            : "border-foreground/30 bg-muted/30 hover:border-foreground/50 hover:bg-muted/50"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <span className="text-sm text-foreground">
          Drop an image here or click to browse
        </span>
        <span className="mt-1 text-xs text-muted-foreground">
          PNG or JPG
        </span>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="sr-only"
        />
      </label>
      <button type="button" onClick={handleClick} className="btn-transparent shrink-0">
        Upload →
      </button>
    </div>
  );
}
