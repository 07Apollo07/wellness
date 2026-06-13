import React, { useRef } from 'react';
import { exportData, importData } from '@/lib/storage';

/**
 * Simple UI for exporting the current local data as an encrypted JSON string
 * and importing a previously exported string.
 */
export default function ExportImportControls() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const encrypted = exportData();
    const blob = new Blob([encrypted], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'serenity_backup.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      importData(text);
      // Reload to reflect imported data
      window.location.reload();
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex gap-4 items-center mt-4">
      <button
        onClick={handleExport}
        className="px-3 py-1.5 rounded bg-[#7ec8a4] text-[#0a0f1e] font-medium hover:bg-[#7ec8a4]/90"
      >
        Export Data
      </button>
      <button
        onClick={handleImportClick}
        className="px-3 py-1.5 rounded bg-[#f5a623] text-[#0a0f1e] font-medium hover:bg-[#f5a623]/90"
      >
        Import Data
      </button>
      <input
        type="file"
        accept=".txt"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  );
}
