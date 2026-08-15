import React, { useState } from 'react';
import {
  Printer,
  Download,
  Copy,
  Check,
  Edit3,
  Eye,
  Save,
  X,
  FileText,
  Sparkles,
} from 'lucide-react';
import Swal from 'sweetalert2';
import { downloadDocFile, copyHtmlToClipboard, getDocumentStyles } from '../../services/docExportHelper';
import { GeneratedDocument } from '../../types';

interface DocViewerModalProps {
  document: GeneratedDocument | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (doc: GeneratedDocument) => void;
}

export const DocViewerModal: React.FC<DocViewerModalProps> = ({
  document,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen || !document) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [contentHtml, setContentHtml] = useState(document.contentHtml);
  const [copied, setCopied] = useState(false);
  const [isLandscape, setIsLandscape] = useState(document.isLandscape || false);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      Swal.fire('Info', 'Mohon izinkan popup window untuk mencetak dokumen.', 'info');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${document.title}</title>
          <style>
            ${getDocumentStyles(isLandscape)}
          </style>
        </head>
        <body onload="window.print();">
          ${contentHtml}
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadWord = () => {
    downloadDocFile(document.title, contentHtml, isLandscape);
    Swal.fire({
      icon: 'success',
      title: 'File Word Berhasil Diunduh!',
      text: `Dokumen ${document.title} telah siap dibuka di Microsoft Word.`,
      timer: 2000,
      showConfirmButton: false,
      toast: true,
      position: 'top-end',
    });
  };

  const handleCopyHtml = async () => {
    const ok = await copyHtmlToClipboard(contentHtml);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      Swal.fire({
        icon: 'success',
        title: 'HTML Tersalin!',
        text: 'Kode HTML dokumen berhasil disalin ke clipboard.',
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
      });
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave({
        ...document,
        contentHtml,
        isLandscape,
        updatedAt: new Date().toISOString(),
      });
      setIsEditing(false);
      Swal.fire({
        icon: 'success',
        title: 'Perubahan Disimpan',
        text: 'Dokumen berhasil diperbarui di database sistem.',
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-600 text-white">
                  {document.docCode}
                </span>
                <h3 className="font-bold text-base text-slate-100 line-clamp-1">{document.title}</h3>
              </div>
              <p className="text-xs text-slate-400">
                {document.mapel} &bull; {document.kelas} &bull; {document.semester}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLandscape(!isLandscape)}
              className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                isLandscape
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
              title="Ubah orientasi cetak Landscape / Portrait"
            >
              {isLandscape ? 'Landscape (Mendatar)' : 'Portrait (Tegak)'}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-2.5 bg-slate-100 border-b border-slate-200 text-sm">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isEditing
                  ? 'bg-amber-600 text-white hover:bg-amber-700'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {isEditing ? <Eye className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
              {isEditing ? 'Lihat Tampilan Cetak' : 'Edit Konten HTML'}
            </button>

            {isEditing && (
              <button
                onClick={handleSave}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                Simpan Perubahan
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak / PDF
            </button>

            <button
              onClick={handleDownloadWord}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Download Word (.doc)
            </button>

            <button
              onClick={handleCopyHtml}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Tersalin!' : 'Salin Kode HTML'}
            </button>
          </div>
        </div>

        {/* Modal Body / Document Preview Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-200/70 flex justify-center">
          {isEditing ? (
            <div className="w-full bg-white rounded-lg p-4 border border-slate-300 shadow-sm">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                Editor HTML Dokumen (Dapat diedit langsung):
              </label>
              <textarea
                value={contentHtml}
                onChange={(e) => setContentHtml(e.target.value)}
                className="w-full h-[520px] p-3 font-mono text-xs text-slate-800 bg-slate-50 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          ) : (
            <div
              className={`bg-white text-slate-900 shadow-xl border border-slate-300 p-8 sm:p-12 print-container ${
                isLandscape ? 'w-full max-w-[1050px]' : 'w-full max-w-[800px]'
              } min-h-[700px] transition-all`}
              style={{
                fontFamily: "'Times New Roman', Times, serif",
                fontSize: '11pt',
                lineHeight: '1.5',
              }}
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
          )}
        </div>

        {/* Modal Footer Note */}
        <div className="px-5 py-2.5 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kop Surat Tengah Standar & Tabel TTD 2 Kolom Sejajar Tanpa Border Aktif</span>
          </div>
          <span>Format Siap Cetak &bull; Kompatibel Microsoft Word & A4 PDF</span>
        </div>
      </div>
    </div>
  );
};
