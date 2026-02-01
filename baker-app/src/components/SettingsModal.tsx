import { useState, useRef } from 'react';
import { X, Export, DownloadSimple, UploadSimple } from '@phosphor-icons/react';
import { exportData, importData, downloadAsJson, type ExportData } from '../utils/localStorage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ExportOption = 'history' | 'latest' | 'both';

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [exportOption, setExportOption] = useState<ExportOption>('both');
  const [importOption, setImportOption] = useState<ExportOption>('both');
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    const includeHistory = exportOption === 'history' || exportOption === 'both';
    const includeLatest = exportOption === 'latest' || exportOption === 'both';
    const data = exportData(includeHistory, includeLatest);
    
    const filename = `baker-export-${new Date().toISOString().split('T')[0]}.json`;
    downloadAsJson(data, filename);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string) as ExportData;
        
        if (!data.exportedAt) {
          setImportMessage('Invalid file format');
          return;
        }

        const importHistory = importOption === 'history' || importOption === 'both';
        const importLatest = importOption === 'latest' || importOption === 'both';
        
        importData(data, importHistory, importLatest);
        setImportMessage('Import successful!');
        
        setTimeout(() => {
          setImportMessage(null);
        }, 3000);
      } catch {
        setImportMessage('Failed to parse file');
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-stone-200">
          <h2 className="text-lg font-medium text-stone-900">Settings</h2>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Export Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-stone-700">
              <Export size={18} />
              <h3 className="font-medium">Export Data</h3>
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="export"
                  value="history"
                  checked={exportOption === 'history'}
                  onChange={() => setExportOption('history')}
                  className="text-amber-600 focus:ring-amber-500"
                />
                <span className="text-sm text-stone-600">History only</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="export"
                  value="latest"
                  checked={exportOption === 'latest'}
                  onChange={() => setExportOption('latest')}
                  className="text-amber-600 focus:ring-amber-500"
                />
                <span className="text-sm text-stone-600">Latest recipes only</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="export"
                  value="both"
                  checked={exportOption === 'both'}
                  onChange={() => setExportOption('both')}
                  className="text-amber-600 focus:ring-amber-500"
                />
                <span className="text-sm text-stone-600">Both</span>
              </label>
            </div>

            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors text-sm"
            >
              <DownloadSimple size={16} />
              Download JSON
            </button>
          </div>

          <hr className="border-stone-200" />

          {/* Import Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-stone-700">
              <UploadSimple size={18} />
              <h3 className="font-medium">Import Data</h3>
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="import"
                  value="history"
                  checked={importOption === 'history'}
                  onChange={() => setImportOption('history')}
                  className="text-amber-600 focus:ring-amber-500"
                />
                <span className="text-sm text-stone-600">History only</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="import"
                  value="latest"
                  checked={importOption === 'latest'}
                  onChange={() => setImportOption('latest')}
                  className="text-amber-600 focus:ring-amber-500"
                />
                <span className="text-sm text-stone-600">Latest recipes only</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="import"
                  value="both"
                  checked={importOption === 'both'}
                  onChange={() => setImportOption('both')}
                  className="text-amber-600 focus:ring-amber-500"
                />
                <span className="text-sm text-stone-600">Both</span>
              </label>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            
            <button
              onClick={handleImportClick}
              className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors text-sm"
            >
              <UploadSimple size={16} />
              Upload JSON
            </button>

            {importMessage && (
              <p className={`text-sm ${importMessage.includes('successful') ? 'text-green-600' : 'text-red-600'}`}>
                {importMessage}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
