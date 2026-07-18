import React, { useState } from 'react';
import { Copy, FileText, Share2, Printer, Download, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { exportToPDF } from '../Tools/AI_Legal/utils/exportToPDF';

/**
 * Reusable toolbar matching the General Legal Chat actions.
 * Props:
 * - msg: the message object containing at least `id` and `content`.
 * - outputLang, setOutputLang, getDisplayText, translateText: language utilities from useOutputLanguage.
 */
const OutputActionToolbar = ({ msg, outputLang, setOutputLang, getDisplayText, translateText }) => {
  const [copied, setCopied] = useState(false);
  const [activeDownloadMenu, setActiveDownloadMenu] = useState(false);
  const [activeShareMenu, setActiveShareMenu] = useState(false);

  const handleCopy = () => {
    const resolved = getDisplayText(msg.content);
    navigator.clipboard.writeText(resolved);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied to Clipboard');
  };

  const handleExportPDF = async () => {
    const resolved = getDisplayText(msg.content);
    const isHi = outputLang === 'hi';
    const toastId = toast.loading(isHi ? 'PDF तैयार किया जा रहा है...' : 'Generating PDF...');
    try {
      const el = document.getElementById(`msg-content-${msg.id}`);
      await exportToPDF({
        element: el,
        text: resolved,
        title: isHi ? 'AISA एआई कानूनी चैट रिपोर्ट' : 'AISA AI Legal Chat Report',
        filename: 'Legal_Chat_Report',
        lang: outputLang,
        meta: {
          [isHi ? 'संदर्भ आईडी' : 'Reference ID']: msg.id,
          [isHi ? 'उत्पन्न तिथि' : 'Date Generated']: new Date().toLocaleString(),
        },
      });
      toast.success(isHi ? 'PDF सफलतापूर्वक निर्यात किया गया' : 'PDF exported successfully', {
        id: toastId,
      });
    } catch (e) {
      console.error(e);
      toast.error(isHi ? 'PDF निर्यात विफल' : 'Failed to export PDF', { id: toastId });
    }
  };

  const downloadFile = type => {
    const resolved = getDisplayText(msg.content);
    const blob = new Blob([resolved], {
      type: type === 'doc' ? 'application/msword' : 'text/plain;charset=utf-8',
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    const ext = type === 'doc' ? '.doc' : '.txt';
    a.download = `courtroom_report_${Date.now()}${ext}`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const handleShareEmail = () => {
    const resolved = getDisplayText(msg.content);
    const isHi = outputLang === 'hi';
    window.open(
      `mailto:?subject=${encodeURIComponent(isHi ? 'एआई कानूनी रिपोर्ट' : 'AI Legal Report')}&body=${encodeURIComponent(resolved.slice(0, 2000) + '\n\n...[Report Truncated]')}`
    );
  };

  const handleShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Share link copied to clipboard');
  };

  const handlePrint = () => {
    const resolved = getDisplayText(msg.content);
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Popup blocked! Please allow popups to print.');
      return;
    }
    const isHi = outputLang === 'hi';
    const cleanHtml = `
      <html>
        <head>
          <title>${isHi ? 'AISA कानूनी रिपोर्ट' : 'AISA Legal Report'}</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 40px; line-height: 1.6; color: #111; }
            h1 { text-align: center; font-size: 22px; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 20px; }
            .content { font-size: 13.5px; white-space: pre-wrap; text-align: justify; }
          </style>
        </head>
        <body>
          <h1>${isHi ? 'AISA कोर्ट-रेडी कानूनी रिपोर्ट' : 'AISA COURT-READY LEGAL REPORT'}</h1>
          <div class="content">${resolved.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
          <script>window.onload = function(){window.print(); window.close();}</script>
        </body>
      </html>`;
    printWindow.document.write(cleanHtml);
    printWindow.document.close();
  };

  return (
    <div className="legal-research-action-bar border-t border-slate-100 dark:border-white/5 mt-3 pt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-slate-500 dark:text-slate-400">
      <button
        onClick={handleCopy}
        className="legal-research-action-btn flex items-center gap-1 font-bold hover:text-indigo-600 transition-colors"
        title="Copy Response"
      >
        {copied ? <Check size={13} /> : <Copy size={13} />}
        <span>Copy Response</span>
      </button>
      <span className="text-slate-200 dark:text-white/10 select-none">|</span>
      <button
        onClick={handleExportPDF}
        className="legal-research-action-btn flex items-center gap-1 font-bold hover:text-indigo-600 transition-colors"
        title="Export PDF"
      >
        <FileText size={13} />
        <span>Export PDF</span>
      </button>
      <span className="text-slate-200 dark:text-white/10 select-none">|</span>
      {/* Download Menu */}
      <div className="relative">
        <button
          onClick={() => setActiveDownloadMenu(prev => !prev)}
          className="legal-research-action-btn flex items-center gap-1 font-bold hover:text-indigo-600 transition-colors"
          title="Download options"
        >
          <Download size={13} />
          <span>Download</span>
        </button>
        {activeDownloadMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setActiveDownloadMenu(false)} />
            <div className="absolute left-0 bottom-full mb-2 z-20 w-32 rounded-lg bg-white dark:bg-[#1e293b] border border-slate-200/80 dark:border-white/10 shadow-xl p-1 flex flex-col gap-0.5">
              <button
                onClick={() => {
                  downloadFile('txt');
                  setActiveDownloadMenu(false);
                }}
                className="w-full text-left px-2.5 py-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 rounded-md transition-colors"
              >
                TXT Format
              </button>
              <button
                onClick={() => {
                  downloadFile('doc');
                  setActiveDownloadMenu(false);
                }}
                className="w-full text-left px-2.5 py-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 rounded-md transition-colors"
              >
                DOCX Format
              </button>
              <button
                onClick={() => {
                  handleExportPDF();
                  setActiveDownloadMenu(false);
                }}
                className="w-full text-left px-2.5 py-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 rounded-md transition-colors"
              >
                PDF Format
              </button>
            </div>
          </>
        )}
      </div>
      <span className="text-slate-200 dark:text-white/10 select-none">|</span>
      {/* Share Menu */}
      <div className="relative">
        <button
          onClick={() => setActiveShareMenu(prev => !prev)}
          className="legal-research-action-btn flex items-center gap-1 font-bold hover:text-indigo-600 transition-colors"
          title="Share options"
        >
          <Share2 size={13} />
          <span>Share Report</span>
        </button>
        {activeShareMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setActiveShareMenu(false)} />
            <div className="absolute left-0 bottom-full mb-2 z-20 w-38 rounded-lg bg-white dark:bg-[#1e293b] border border-slate-200/80 dark:border-white/10 shadow-xl p-1 flex flex-col gap-0.5">
              <button
                onClick={() => {
                  handleShareEmail();
                  setActiveShareMenu(false);
                }}
                className="w-full text-left px-2.5 py-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 rounded-md transition-colors"
              >
                Email Report
              </button>
              <button
                onClick={() => {
                  handleShareLink();
                  setActiveShareMenu(false);
                }}
                className="w-full text-left px-2.5 py-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 rounded-md transition-colors"
              >
                Copy Link
              </button>
              <button
                onClick={() => {
                  handleExportPDF();
                  setActiveShareMenu(false);
                }}
                className="w-full text-left px-2.5 py-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 rounded-md transition-colors"
              >
                Download PDF
              </button>
            </div>
          </>
        )}
      </div>
      <button
        onClick={handlePrint}
        className="legal-research-action-btn flex items-center gap-1 font-bold hover:text-indigo-600 transition-colors"
        title="Print Report"
      >
        <Printer size={13} />
        <span>Print</span>
      </button>
    </div>
  );
};

export default OutputActionToolbar;
