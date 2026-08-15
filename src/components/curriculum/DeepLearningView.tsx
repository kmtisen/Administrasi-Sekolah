import React, { useState } from 'react';
import {
  Sparkles,
  Heart,
  FileCheck,
  Brain,
  Layers,
  Printer,
  Download,
  Copy,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Smile,
  Zap,
} from 'lucide-react';
import Swal from 'sweetalert2';
import { User, SchoolConfig, ClassItem, GeneratedDocument } from '../../types';
import { generateCurriculumDocument } from '../../services/geminiService';
import { DocViewerModal } from './DocViewerModal';

interface DeepLearningViewProps {
  currentUser: User;
  schoolConfig: SchoolConfig;
  classes: ClassItem[];
  onSaveDocument: (doc: GeneratedDocument) => void;
}

export const DeepLearningView: React.FC<DeepLearningViewProps> = ({
  currentUser,
  schoolConfig,
  classes,
  onSaveDocument,
}) => {
  const [docType, setDocType] = useState<'MODUL-DEEP-LEARNING' | 'ASESMEN-SUMATIF-AI'>('MODUL-DEEP-LEARNING');
  const [mapel, setMapel] = useState(currentUser.mapel || 'Matematika');
  const [kelas, setKelas] = useState(classes[0]?.namaKelas || 'Kelas VII');
  const [fase, setFase] = useState('Fase D');
  const [semester, setSemester] = useState<string>(schoolConfig.semesterAktif || 'Ganjil');
  const [materiPokok, setMateriPokok] = useState('Aljabar Linear & Penyelesaian Masalah Kontekstual');
  const [alokasiWaktu, setAlokasiWaktu] = useState('2 Pertemuan (4 x 40 Menit)');

  // Deep Learning Custom Highlights
  const [mindfulFocus, setMindfulFocus] = useState('Refleksi kesadaran diri, hening sejenak, dan fokus tujuan belajar');
  const [meaningfulFocus, setMeaningfulFocus] = useState('Studi kasus nyata penganggaran keuangan keluarga dan etika kejujuran');
  const [joyfulFocus, setJoyfulFocus] = useState('Game kuis interaktif, kerja kelompok kolaboratif, dan presentasi kreatif');

  const [isGenerating, setIsGenerating] = useState(false);
  const [activeViewerDoc, setActiveViewerDoc] = useState<GeneratedDocument | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      const customTopic =
        docType === 'MODUL-DEEP-LEARNING'
          ? `${materiPokok}. [Pilar Deep Learning: Mindful=(${mindfulFocus}), Meaningful=(${meaningfulFocus}), Joyful=(${joyfulFocus})]`
          : `${materiPokok}. Asesmen Sumatif HOTS + Rubrik Lengkap`;

      const generated = await generateCurriculumDocument({
        docType,
        mapel,
        kelas,
        fase,
        semester,
        materiPokok: customTopic,
        alokasiWaktu,
        schoolConfig,
        teacher: currentUser,
        isLandscape: false,
      });

      onSaveDocument(generated);
      setActiveViewerDoc(generated);

      Swal.fire({
        icon: 'success',
        title: 'Dokumen Berhasil Dibuat!',
        text: `${generated.title} telah siap dicetak atau diunduh Word.`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err: any) {
      console.error(err);
      Swal.fire('Gagal Membuat Dokumen', err?.message || 'Terjadi kesalahan sistem.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-purple-600 text-white font-bold text-[10px] uppercase tracking-wider">
                Deep Learning Engine
              </span>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Modul Ajar Deep Learning & Asesmen Sumatif AI
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Pembelajaran mendalam dengan 3 Pilar (Mindful, Meaningful, & Joyful Learning) serta Asesmen Sumatif HOTS terintegrasi.
            </p>
          </div>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setDocType('MODUL-DEEP-LEARNING')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            docType === 'MODUL-DEEP-LEARNING'
              ? 'bg-slate-900 border-slate-800 text-white shadow-xl ring-2 ring-purple-500'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                docType === 'MODUL-DEEP-LEARNING' ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700'
              }`}
            >
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-sm">Modul Ajar Deep Learning</div>
              <div className="text-xs opacity-75 mt-0.5">
                Mindful Learning, Meaningful Learning, & Joyful Learning
              </div>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setDocType('ASESMEN-SUMATIF-AI')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            docType === 'ASESMEN-SUMATIF-AI'
              ? 'bg-slate-900 border-slate-800 text-white shadow-xl ring-2 ring-purple-500'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                docType === 'ASESMEN-SUMATIF-AI' ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700'
              }`}
            >
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-sm">Asesmen Sumatif HOTS & Rubrik</div>
              <div className="text-xs opacity-75 mt-0.5">
                Kisi-kisi soal, paket instrumen PG + Uraian, dan pedoman penskoran
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* 3 Pillars Badge Highlight for Deep Learning */}
      {docType === 'MODUL-DEEP-LEARNING' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase mb-1">
              <Zap className="w-4 h-4 text-emerald-600" />
              1. Mindful Learning
            </div>
            <p className="text-[11px] text-emerald-900 leading-relaxed">
              Membangun kehadiran penuh, fokus, kesadaran emosional, dan penghayatan makna sebelum memulai pembelajaran.
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
            <div className="flex items-center gap-2 text-blue-800 font-bold text-xs uppercase mb-1">
              <BookOpen className="w-4 h-4 text-blue-600" />
              2. Meaningful Learning
            </div>
            <p className="text-[11px] text-blue-900 leading-relaxed">
              Mengaitkan konsep materi dengan konteks kehidupan nyata, nilai kemanusiaan, dan pemecahan masalah otentik.
            </p>
          </div>

          <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase mb-1">
              <Smile className="w-4 h-4 text-amber-600" />
              3. Joyful Learning
            </div>
            <p className="text-[11px] text-amber-900 leading-relaxed">
              Menciptakan suasana belajar yang menggembirakan, interaktif, apresiatif, dan menumbuhkan rasa ingin tahu.
            </p>
          </div>
        </div>
      )}

      {/* Parameter Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600" />
          Konfigurasi Dokumen
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Mata Pelajaran</label>
            <input
              type="text"
              value={mapel}
              onChange={(e) => setMapel(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Kelas & Rombel</label>
            <select
              value={kelas}
              onChange={(e) => {
                setKelas(e.target.value);
                const found = classes.find((c) => c.namaKelas === e.target.value);
                if (found) setFase(found.fase);
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.namaKelas}>
                  {c.namaKelas} ({c.fase})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Fase Kurikulum</label>
            <select
              value={fase}
              onChange={(e) => setFase(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <option value="Fase D">Fase D (Kelas 7-9 SMP)</option>
              <option value="Fase E">Fase E (Kelas 10 SMA)</option>
              <option value="Fase F">Fase F (Kelas 11-12 SMA)</option>
              <option value="Fase A">Fase A (Kelas 1-2 SD)</option>
              <option value="Fase B">Fase B (Kelas 3-4 SD)</option>
              <option value="Fase C">Fase C (Kelas 5-6 SD)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Semester</label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <option value="Ganjil">Semester Ganjil (1)</option>
              <option value="Genap">Semester Genap (2)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Alokasi Waktu</label>
            <input
              type="text"
              value={alokasiWaktu}
              onChange={(e) => setAlokasiWaktu(e.target.value)}
              placeholder="Contoh: 2 JP (2 x 40 Menit)"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Materi Pokok Pembelajaran</label>
            <input
              type="text"
              value={materiPokok}
              onChange={(e) => setMateriPokok(e.target.value)}
              placeholder="Contoh: Konsep Aljabar dan Persamaan Linier"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Generate Action Button */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-purple-600" />
            <span>Format Resmi Dilengkapi Kop Sekolah & Kolom Tanda Tangan Sejajar</span>
          </div>

          <button
            type="button"
            disabled={isGenerating}
            onClick={handleGenerate}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-950/20 transition-all transform active:scale-[0.99] disabled:opacity-50"
          >
            {isGenerating ? (
              <span className="inline-flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin" />
                Menyusun Pembelajaran Deep Learning...
              </span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate {docType === 'MODUL-DEEP-LEARNING' ? 'Modul Ajar Deep Learning' : 'Asesmen Sumatif HOTS'}
              </>
            )}
          </button>
        </div>
      </div>

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
