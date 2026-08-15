import React, { useState } from 'react';
import {
  Heart,
  Sparkles,
  FileCheck,
  Printer,
  Download,
  Copy,
  Layers,
  BookOpen,
  CheckCircle,
  Award,
  Users,
  Compass,
} from 'lucide-react';
import Swal from 'sweetalert2';
import { User, SchoolConfig, ClassItem, GeneratedDocument } from '../../types';
import { generateCurriculumDocument } from '../../services/geminiService';
import { DocViewerModal } from './DocViewerModal';

interface Kbc10ViewProps {
  currentUser: User;
  schoolConfig: SchoolConfig;
  classes: ClassItem[];
  onSaveDocument: (doc: GeneratedDocument) => void;
}

const KBC_10_DOCS = [
  {
    code: 'KBC-ACP',
    name: '1. Analisis Capaian (ACP KBC)',
    desc: 'Pemetaan elemen CP & internalisasi 7 Nilai Inti Cinta (KBC).',
    isLandscape: false,
  },
  {
    code: 'KBC-TP',
    name: '2. Tujuan Pembelajaran (TP KBC)',
    desc: 'Perumusan kompetensi akademis berpadu karakter cinta kasih.',
    isLandscape: false,
  },
  {
    code: 'KBC-ATP',
    name: '3. Alur TP Terintegrasi (ATP KBC)',
    desc: 'Matriks alur pembelajaran terpadu nilai kebajikan & JP.',
    isLandscape: true,
  },
  {
    code: 'KBC-PROTA',
    name: '4. Program Tahunan (PROTA KBC)',
    desc: 'Distribusi materi 1 tahun berkesinambungan proyek karakter.',
    isLandscape: false,
  },
  {
    code: 'KBC-PROSEM',
    name: '5. Program Semester (PROSEM KBC)',
    desc: 'Matriks sebaran mingguan materi & pembiasaan cinta.',
    isLandscape: true,
  },
  {
    code: 'KBC-KKTP',
    name: '6. KKTP & Profil Cinta (KKTP KBC)',
    desc: 'Kriteria ketercapaian holistik akademis dan budi pekerti.',
    isLandscape: false,
  },
  {
    code: 'KBC-MODUL',
    name: '7. Modul Ajar Terpadu (Modul KBC)',
    desc: 'Sintaks Deep Learning (Mindful, Meaningful, Joyful) berbasis Cinta.',
    isLandscape: false,
  },
  {
    code: 'KBC-LKPD',
    name: '8. LKPD Penuh Cinta (LKPD KBC)',
    desc: 'Lembar kerja kolaboratif, kontekstual, dan reflektif.',
    isLandscape: false,
  },
  {
    code: 'KBC-FORMATIF',
    name: '9. Rubrik Formatif KBC',
    desc: 'Lembar observasi pembiasaan akhlak & pemahaman konsep.',
    isLandscape: false,
  },
  {
    code: 'KBC-SUMATIF',
    name: '10. Rubrik Sumatif & Portofolio',
    desc: 'Evaluasi akhir materi, jurnal refleksi, & portofolio karya cinta.',
    isLandscape: false,
  },
];

export const Kbc10View: React.FC<Kbc10ViewProps> = ({
  currentUser,
  schoolConfig,
  classes,
  onSaveDocument,
}) => {
  const [selectedDocCode, setSelectedDocCode] = useState('KBC-ACP');
  const [mapel, setMapel] = useState(currentUser.mapel || 'Matematika');
  const [kelas, setKelas] = useState(classes[0]?.namaKelas || 'Kelas VII');
  const [fase, setFase] = useState('Fase D');
  const [semester, setSemester] = useState<string>(schoolConfig.semesterAktif || 'Ganjil');
  const [materiPokok, setMateriPokok] = useState('Konsep Bilangan, Aljabar, dan Pembiasaan Kasih Sayang');
  const [alokasiWaktu, setAlokasiWaktu] = useState('18 Minggu (72 JP)');
  const [selectedNilaiCinta, setSelectedNilaiCinta] = useState<string>('Cinta Sesama & Kebajikan');

  const [isGenerating, setIsGenerating] = useState(false);
  const [activeViewerDoc, setActiveViewerDoc] = useState<GeneratedDocument | null>(null);

  const selectedDocInfo = KBC_10_DOCS.find((d) => d.code === selectedDocCode) || KBC_10_DOCS[0];

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      const topicWithKbc = `${materiPokok}. [Nilai Karakter KBC yang Diintegrasikan: ${selectedNilaiCinta}]`;

      const generated = await generateCurriculumDocument({
        docType: selectedDocCode,
        mapel,
        kelas,
        fase,
        semester,
        materiPokok: topicWithKbc,
        alokasiWaktu,
        schoolConfig,
        teacher: currentUser,
        isLandscape: selectedDocInfo.isLandscape,
      });

      onSaveDocument(generated);
      setActiveViewerDoc(generated);

      Swal.fire({
        icon: 'success',
        title: 'Dokumen KBC Berhasil Dibuat!',
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
          <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-bold text-[10px] uppercase tracking-wider">
                10 Dokumen KBC Terpadu
              </span>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Perangkat Ajar Kurikulum Berbasis Cinta (KBC)
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Integrasi harmonis capaian kompetensi kurikulum nasional dengan internalisasi nilai-nilai cinta, adab, dan keluhuran budi.
            </p>
          </div>
        </div>
      </div>

      {/* 10 Documents Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {KBC_10_DOCS.map((doc) => {
          const isSelected = selectedDocCode === doc.code;
          return (
            <button
              key={doc.code}
              type="button"
              onClick={() => setSelectedDocCode(doc.code)}
              className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 border-slate-800 text-white shadow-xl ring-2 ring-rose-500 transform -translate-y-1'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div>
                <div
                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase mb-1.5 ${
                    isSelected
                      ? 'bg-rose-500 text-white font-black'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {doc.code}
                </div>
                <div className="font-extrabold text-xs leading-snug line-clamp-2">{doc.name}</div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-100/20 text-[10px] opacity-70">
                {doc.isLandscape ? 'Format Landscape' : 'Format Portrait'}
              </div>
            </button>
          );
        })}
      </div>

      {/* 7 Values of Love Banner */}
      <div className="bg-gradient-to-r from-rose-50 via-amber-50 to-emerald-50 p-5 rounded-2xl border border-rose-200/80">
        <div className="flex items-center gap-2 text-rose-900 font-extrabold text-xs uppercase mb-2">
          <Award className="w-4 h-4 text-rose-600" />
          7 Pilar Nilai Inti Kurikulum Berbasis Cinta (KBC):
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            '1. Cinta Tuhan & Rasul',
            '2. Cinta Diri & Kesehatan',
            '3. Cinta Sesama Manusia',
            '4. Cinta Ilmu & Hikmah',
            '5. Cinta Lingkungan Hidup',
            '6. Cinta Tanah Air & Bangsa',
            '7. Cinta Kebajikan & Amal Saleh',
          ].map((val, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSelectedNilaiCinta(val)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                selectedNilaiCinta === val
                  ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                  : 'bg-white/80 border-slate-200 text-slate-700 hover:bg-white'
              }`}
            >
              {val}
            </button>
          ))}
        </div>
      </div>

      {/* Parameter Configuration Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-600" />
              Parameter Dokumen: {selectedDocInfo.name} ({selectedDocInfo.code})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{selectedDocInfo.desc}</p>
          </div>

          <span
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${
              selectedDocInfo.isLandscape
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
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
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
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
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
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
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
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
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
            >
              <option value="Ganjil">Semester Ganjil (1)</option>
              <option value="Genap">Semester Genap (2)</option>
              <option value="Ganjil & Genap">1 Tahun (Ganjil & Genap)</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Topik Materi & Pengamalan Cinta
            </label>
            <input
              type="text"
              value={materiPokok}
              onChange={(e) => setMateriPokok(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Generate Action Button */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-rose-600" />
            <span>Kop Resmi Sekolah & Tabel Tanda Tangan 2 Kolom Sejajar Tanpa Border</span>
          </div>

          <button
            type="button"
            disabled={isGenerating}
            onClick={handleGenerate}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-rose-950/20 transition-all transform active:scale-[0.99] disabled:opacity-50"
          >
            {isGenerating ? (
              <span className="inline-flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin" />
                Menyusun Dokumen KBC...
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
