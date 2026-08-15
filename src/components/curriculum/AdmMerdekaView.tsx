import React, { useState } from 'react';
import {
  FileCheck,
  Sparkles,
  Printer,
  Download,
  Copy,
  Eye,
  Building,
  GraduationCap,
  Calendar,
  Layers,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import Swal from 'sweetalert2';
import { User, SchoolConfig, ClassItem, GeneratedDocument } from '../../types';
import { generateCurriculumDocument } from '../../services/geminiService';
import { DocViewerModal } from './DocViewerModal';

interface AdmMerdekaViewProps {
  currentUser: User;
  schoolConfig: SchoolConfig;
  classes: ClassItem[];
  onSaveDocument: (doc: GeneratedDocument) => void;
}

const MERDEKA_DOCS = [
  {
    code: 'ADM-CP',
    name: 'Capaian Pembelajaran (CP)',
    desc: 'Analisis CP elemen, fase, dan rumusan capaian kompetensi esensial.',
    isLandscape: false,
    iconColor: 'from-emerald-500 to-teal-600',
  },
  {
    code: 'ADM-TP',
    name: 'Tujuan Pembelajaran (TP)',
    desc: 'Penjabaran kompetensi, konten materi, dan indikator ketercapaian.',
    isLandscape: false,
    iconColor: 'from-teal-500 to-cyan-600',
  },
  {
    code: 'ADM-ATP',
    name: 'Alur Tujuan Pembelajaran (ATP)',
    desc: 'Matriks alur pembelajaran terstruktur, alokasi jam, dan profil kelulusan.',
    isLandscape: true,
    iconColor: 'from-blue-500 to-indigo-600',
  },
  {
    code: 'ADM-PROTA',
    name: 'Program Tahunan (PROTA)',
    desc: 'Distribusi alokasi JP per semester dan lingkup materi selama 1 tahun.',
    isLandscape: false,
    iconColor: 'from-indigo-500 to-purple-600',
  },
  {
    code: 'ADM-PROSEM',
    name: 'Program Semester (PROSEM)',
    desc: 'Matriks distribusi materi dan target mingguan per bulan dalam semester.',
    isLandscape: true,
    iconColor: 'from-purple-500 to-pink-600',
  },
  {
    code: 'ADM-KKTP',
    name: 'Kriteria Ketercapaian TP (KKTP)',
    desc: 'Rubrik interval nilai, skala deskripsi ketercapaian, dan tindak lanjut intervensi.',
    isLandscape: false,
    iconColor: 'from-amber-500 to-orange-600',
  },
];

export const AdmMerdekaView: React.FC<AdmMerdekaViewProps> = ({
  currentUser,
  schoolConfig,
  classes,
  onSaveDocument,
}) => {
  const [selectedDocCode, setSelectedDocCode] = useState('ADM-CP');
  const [mapel, setMapel] = useState(currentUser.mapel || 'Matematika');
  const [kelas, setKelas] = useState(classes[0]?.namaKelas || 'Kelas VII');
  const [fase, setFase] = useState('Fase D');
  const [semester, setSemester] = useState<string>(schoolConfig.semesterAktif || 'Ganjil');
  const [materiPokok, setMateriPokok] = useState('Bilangan Bulat & Pecahan, Aljabar Linear');
  const [alokasiWaktu, setAlokasiWaktu] = useState('18 Minggu Efektif (72 JP)');

  const [isGenerating, setIsGenerating] = useState(false);
  const [activeViewerDoc, setActiveViewerDoc] = useState<GeneratedDocument | null>(null);

  const selectedDocInfo = MERDEKA_DOCS.find((d) => d.code === selectedDocCode) || MERDEKA_DOCS[0];

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      const generated = await generateCurriculumDocument({
        docType: selectedDocCode,
        mapel,
        kelas,
        fase,
        semester,
        materiPokok,
        alokasiWaktu,
        schoolConfig,
        teacher: currentUser,
        isLandscape: selectedDocInfo.isLandscape,
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
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px] uppercase tracking-wider">
                6 Dokumen Standar
              </span>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Generator Perangkat Ajar Kurikulum Merdeka AI
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              CP, TP, ATP, PROTA, PROSEM, dan KKTP terstandar format resmi dengan Kop Surat & Tabel Tanda Tangan 2 Kolom Sejajar.
            </p>
          </div>
        </div>
      </div>

      {/* Document Selection Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {MERDEKA_DOCS.map((doc) => {
          const isSelected = selectedDocCode === doc.code;
          return (
            <button
              key={doc.code}
              type="button"
              onClick={() => setSelectedDocCode(doc.code)}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 border-slate-800 text-white shadow-lg ring-2 ring-emerald-500 transform -translate-y-1'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div>
                <div
                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase mb-2 ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 font-black'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {doc.code}
                </div>
                <div className="font-extrabold text-xs leading-snug line-clamp-2">{doc.name}</div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100/20 text-[10px] opacity-70">
                {doc.isLandscape ? 'Format Landscape' : 'Format Portrait'}
              </div>
            </button>
          );
        })}
      </div>

      {/* Parameter Configuration Form Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Parameter Dokumen: {selectedDocInfo.name} ({selectedDocInfo.code})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{selectedDocInfo.desc}</p>
          </div>

          <span
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${
              selectedDocInfo.isLandscape
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            {selectedDocInfo.isLandscape ? 'Orientasi: Landscape' : 'Orientasi: Portrait'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Mata Pelajaran</label>
            <input
              type="text"
              value={mapel}
              onChange={(e) => setMapel(e.target.value)}
              placeholder="Contoh: Matematika"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Tingkat / Rombel</label>
            <select
              value={kelas}
              onChange={(e) => {
                setKelas(e.target.value);
                const found = classes.find((c) => c.namaKelas === e.target.value);
                if (found) setFase(found.fase);
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="Fase D">Fase D (Kelas 7, 8, 9 SMP)</option>
              <option value="Fase E">Fase E (Kelas 10 SMA)</option>
              <option value="Fase F">Fase F (Kelas 11, 12 SMA)</option>
              <option value="Fase A">Fase A (Kelas 1, 2 SD)</option>
              <option value="Fase B">Fase B (Kelas 3, 4 SD)</option>
              <option value="Fase C">Fase C (Kelas 5, 6 SD)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Semester</label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="Ganjil">Semester Ganjil (1)</option>
              <option value="Genap">Semester Genap (2)</option>
              <option value="Ganjil & Genap">1 Tahun Penuh (Ganjil & Genap)</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Topik Pokok / Ruang Lingkup Materi
            </label>
            <input
              type="text"
              value={materiPokok}
              onChange={(e) => setMateriPokok(e.target.value)}
              placeholder="Contoh: Bilangan Bulat, Operasi Hitung, Persamaan Linear Satu Variabel"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Generate Action Button */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Kop Surat & Pejabat Pengesahan otomatis menyesuaikan data Konfigurasi Sekolah</span>
          </div>

          <button
            type="button"
            disabled={isGenerating}
            onClick={handleGenerate}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/20 transition-all transform active:scale-[0.99] disabled:opacity-50"
          >
            {isGenerating ? (
              <span className="inline-flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin" />
                Menyusun Dokumen AI...
              </span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Dokumen {selectedDocCode}
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
