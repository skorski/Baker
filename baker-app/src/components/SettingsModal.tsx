import { useState, useRef } from 'react';
import { X, Export, DownloadSimple, UploadSimple } from '@phosphor-icons/react';
import { exportData, importData, downloadAsJson, loadProductWeightOverrides, saveProductWeightOverrides, type ExportData } from '../utils/localStorage';
import { doughProducts } from '../data/doughProducts';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ExportOption = 'history' | 'latest' | 'both';

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [exportOption, setExportOption] = useState<ExportOption>('both');
  const [importOption, setImportOption] = useState<ExportOption>('both');
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [weightOverrides, setWeightOverrides] = useState(() => loadProductWeightOverrides());
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
          {/* Product Weights Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-stone-700">
              <span className="text-lg">⚖️</span>
              <h3 className="font-medium">Product Weights</h3>
            </div>
            <p className="text-xs text-stone-400">Override default weights for each product type (grams).</p>
            <div className="space-y-2">
              {doughProducts.map(product => {
                const currentWeight = weightOverrides[product.id] ?? product.weightGrams;
                const isOverridden = weightOverrides[product.id] !== undefined;
                return (
                  <div key={product.id} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span>{product.icon}</span>
                      <span className="text-sm text-stone-700 truncate">{product.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        value={currentWeight}
                        onChange={e => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val) && val > 0) {
                            const next = { ...weightOverrides, [product.id]: val };
                            setWeightOverrides(next);
                            saveProductWeightOverrides(next);
                          }
                        }}
                        className={`w-20 px-2 py-1 text-sm text-right border rounded-md ${
                          isOverridden
                            ? 'border-amber-400 bg-amber-50 text-amber-800'
                            : 'border-stone-200 text-stone-700'
                        }`}
                        min={1}
                      />
                      <span className="text-xs text-stone-400">g</span>
                      {isOverridden && (
                        <button
                          onClick={() => {
                            const next = { ...weightOverrides };
                            delete next[product.id];
                            setWeightOverrides(next);
                            saveProductWeightOverrides(next);
                          }}
                          className="text-xs text-stone-400 hover:text-stone-600 px-1"
                          title={`Reset to ${product.weightGrams}g`}
                        >
                          ↺
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <hr className="border-stone-200" />

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
