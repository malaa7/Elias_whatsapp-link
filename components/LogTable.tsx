import React, { useState } from 'react';
import { HistoryEntry } from '../types';
import { ExternalLink, Copy, Trash2, History, Clock, Check } from 'lucide-react';

interface LogTableProps {
  history: HistoryEntry[];
  onClear: () => void;
  isRTL: boolean;
}

const LogTable: React.FC<LogTableProps> = ({ history, onClear, isRTL }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-50 px-6 py-4 border-b-2 border-slate-100">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 p-2 rounded-lg">
            <History size={20} className="text-indigo-600" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-800 leading-none">
              {isRTL ? 'السجل' : 'History'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {history.length} {isRTL ? 'روابط تم إنشاؤها' : 'links generated'}
            </p>
          </div>
        </div>
        
        {history.length > 0 && (
          <button 
            onClick={onClear}
            className="text-xs font-bold text-red-500 hover:text-white hover:bg-red-500 border border-red-200 hover:border-red-500 px-3 py-2 rounded-lg transition-all flex items-center gap-1.5"
          >
            <Trash2 size={14} />
            {isRTL ? 'مسح الكل' : 'Clear'}
          </button>
        )}
      </div>
      
      {/* Table Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-white relative">
        {history.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 gap-4 p-8 text-center">
            <Clock size={48} className="opacity-20" />
            <div>
              <p className="text-slate-400 font-bold text-lg">
                {isRTL ? 'السجل فارغ' : 'No History Yet'}
              </p>
              <p className="text-sm mt-1 opacity-60 max-w-[200px] mx-auto">
                {isRTL ? 'الروابط التي تقوم بإنشائها ستظهر هنا' : 'Links you generate will appear here automatically'}
              </p>
            </div>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className={`px-5 py-3 font-semibold uppercase text-xs tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                  {isRTL ? 'الرقم' : 'Number'}
                </th>
                <th className={`px-5 py-3 font-semibold uppercase text-xs tracking-wider ${isRTL ? 'text-right' : 'text-left'}`}>
                  {isRTL ? 'التوقيت' : 'Time'}
                </th>
                <th className="px-5 py-3 font-semibold uppercase text-xs tracking-wider w-24 text-center">
                  {isRTL ? 'إجراء' : 'Action'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50 transition-colors group">
                  <td className={`px-5 py-4 font-mono text-slate-700 font-medium ${isRTL ? 'text-right' : 'text-left'}`} dir="ltr">
                    {entry.phoneNumber}
                  </td>
                  <td className={`px-5 py-4 text-slate-400 text-xs ${isRTL ? 'text-right' : 'text-left'}`}>
                    {new Date(entry.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleCopy(entry.fullLink, entry.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          copiedId === entry.id 
                            ? 'text-green-600 bg-green-50' 
                            : 'text-slate-400 hover:text-green-600 hover:bg-green-50'
                        }`}
                        title={isRTL ? "نسخ الرابط" : "Copy Link"}
                      >
                        {copiedId === entry.id ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                      <a 
                        href={entry.fullLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                        title={isRTL ? "فتح" : "Open"}
                      >
                        <ExternalLink size={16} />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default LogTable;