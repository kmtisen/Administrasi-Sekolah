import React, { useState } from 'react';
import {
  Archive,
  Search,
  Eye,
  Trash2,
  Printer,
  Download,
  FileText,
  Sparkles,
  Heart,
  Calendar,
  Layers,
} from 'lucide-react';
import Swal from 'sweetalert2';
import { GeneratedDocument, User } from '../../types';
import { DocViewerModal } from './DocViewerModal';
import { downloadDocFile } from '../../services/docExportHelper';

interface SavedDocsViewProps {
  documents: GeneratedDocument[];
  currentUser: User;
  onSaveDocument: (doc: GeneratedDocument) => void;
  onDeleteDocument: (docId: string) => void;
}

export const SavedDocsView: React.FC<SavedDocsViewProps> = ({
  documents,
  currentUser,
  onSaveDocument,
  onDeleteDocument,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [activeViewerDoc, setActiveViewerDoc] = useState<GeneratedDocument | null>(null);

  const filteredDocs = documents.filter((d) => {
    const matchSearch =
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.docCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.mapel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.kelas.toLowerCase().includes(searchTerm.toLowerCase());

    const isKbc = d.docCode.startsWith('KBC');
    const isMerdeka = d.docCode.startsWith('ADM');
    const isDeep = d.docCode.includes('DEEP') || d.docCode.includes('SUMATIF');

    let matchType = true;
    if (filterType === 'kbc') matchType = isKbc;
    if (filterType === 'merdeka') matchType = isMerdeka;
    if (filterType === 'deep') matchType = isDeep;

    return matchSearch && matchType;
  });

  const handleDelete = (doc: GeneratedDocument) => {
    Swal.fire({
      title: `Hapus Dokumen?`,
      text: `Dokumen "${doc.title}" akan dihapus dari arsip.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
    }).then((res) => {
      if (res.isConfirmed) {
        onDeleteDocument(doc.id);
        Swal.fire({
          icon: 'success',
          title: 'Dokumen Dihapus',
          timer: 1200,
          showConfirmButton: false,
        });
      }
    });
  };

  const handleQuickDownloadWord = (doc: GeneratedDocument) => {
    downloadDocFile(doc.title, doc.contentHtml, doc.isLandscape);
    Swal.fire({
      icon: 'success',
      title: 'Word .doc Terunduh',
      text: doc.title,
      timer: 1500,
      showConfirmButton: false,
      toast: true,
      position: 'top-end',
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <Archive className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Arsip & Repositori Dokumen Perangkat Ajar
            </h1>
            <p className="text-xs text-slate-500">
              Koleksi seluruh dokumen Kurikulum Merdeka, Deep Learning, dan KBC yang telah digenerate AI.
            </p>
          </div>
        </div>

        <div className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
          Total {documents.length} Dokumen Tersimpan
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari judul dokumen, kode ADM/KBC, mapel, atau kelas..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Filter Kategori:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Semua Kategori</option>
            <option value="merdeka">Kurikulum Merdeka (ADM-6)</option>
            <option value="deep">Deep Learning & Asesmen</option>
            <option value="kbc">Kurikulum Berbasis Cinta (KBC-10)</option>
          </select>
        </div>
      </div>

      {/* Document Grid Cards */}
      {filteredDocs.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Archive className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-700">Belum Ada Dokumen di Arsip</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Gunakan menu Generator Kurikulum Merdeka atau KBC untuk membuat dokumen perangkat ajar resmi siap cetak.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => {
            const isKbc = doc.docCode.startsWith('KBC');
            const isDeep = doc.docCode.includes('DEEP') || doc.docCode.includes('SUMATIF');

            return (
              <div
                key={doc.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                        isKbc
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : isDeep
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {doc.docCode}
                    </span>

                    <span className="text-[10px] text-slate-400 font-mono">
                      {doc.isLandscape ? 'Landscape' : 'Portrait'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                    {doc.title}
                  </h3>

                  <div className="mt-3 space-y-1 text-[11px] text-slate-600">
                    <div>
                      <span className="text-slate-400">Mapel:</span> <strong>{doc.mapel}</strong> ({doc.kelas})
                    </div>
                    <div>
                      <span className="text-slate-400">Penyusun:</span> {doc.teacherName}
                    </div>
                    <div className="text-[10px] text-slate-400 pt-1">
                      Diperbarui: {new Date(doc.updatedAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setActiveViewerDoc(doc)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-xs transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Buka Pratinjau
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleQuickDownloadWord(doc)}
                      className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Download File Word .doc"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(doc)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Hapus Dokumen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Document Viewer Modal */}
      <DocViewerModal
        document={activeViewerDoc}
        isOpen={!!activeViewerDoc}
        onClose={() => setActiveViewerDoc(null)}
        onSave={(updated) => {
          onSaveDocument(updated);
          setActiveViewerDoc(updated);
        }}
      />
    </div>
  );
};
