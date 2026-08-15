import React from 'react';
import {
  Users,
  Building,
  FileCheck,
  Heart,
  CalendarCheck,
  GraduationCap,
  Sparkles,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Award,
  CheckCircle2,
  Brain,
  School,
  Clock,
} from 'lucide-react';
import { User, SchoolConfig, Student, ClassItem, GeneratedDocument, HomeroomGuidance, AttendanceRecord } from '../../types';

interface DashboardOverviewProps {
  currentUser: User;
  schoolConfig: SchoolConfig;
  students: Student[];
  classes: ClassItem[];
  documents: GeneratedDocument[];
  guidances: HomeroomGuidance[];
  attendanceRecords: AttendanceRecord[];
  onNavigateTab: (tab: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  currentUser,
  schoolConfig,
  students,
  classes,
  documents,
  guidances,
  attendanceRecords,
  onNavigateTab,
}) => {
  const role = currentUser.role;

  // Key metrics
  const totalStudents = students.length;
  const totalClasses = classes.length;
  const totalDocs = documents.length;
  const totalGuidances = guidances.length;

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayAttendance = attendanceRecords.filter((r) => r.tanggal === todayStr);

  return (
    <div className="space-y-4 max-w-7xl mx-auto font-sans text-slate-800">
      {/* Top 4 Stats Metric Cards */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div 
          onClick={() => onNavigateTab('students')}
          className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs hover:border-indigo-400 transition-all cursor-pointer"
        >
          <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Total Siswa</span>
            <Users className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 flex items-baseline gap-2">
            {totalStudents} <span className="text-[10px] text-emerald-500 font-normal">+100% Aktif</span>
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('classes')}
          className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs hover:border-indigo-400 transition-all cursor-pointer"
        >
          <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Rombel & Kelas</span>
            <Building className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {totalClasses} <span className="text-xs font-semibold text-slate-400">Kelas</span>
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('attendance')}
          className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs hover:border-indigo-400 transition-all cursor-pointer"
        >
          <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Rata Kehadiran</span>
            <CalendarCheck className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-600">
            96.4%
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('kbc-10')}
          className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs border-l-4 border-l-emerald-500 hover:border-emerald-400 transition-all cursor-pointer"
        >
          <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Indeks Cinta (KBC)</span>
            <Heart className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">
            A+ <span className="text-xs font-semibold text-emerald-500">Unggul</span>
          </div>
        </div>
      </section>

      {/* Main Workspace Layout */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left Column: Perangkat Ajar Generator Workspace */}
        <div className="flex-1 flex flex-col gap-4">
          <section className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-3.5 border-b border-slate-200 flex justify-between items-center bg-slate-50/70">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs">
                <Sparkles className="w-4 h-4" />
                <span className="tracking-wide">GENERATOR PERANGKAT AJAR AI</span>
              </div>
              <div className="flex gap-1.5">
                <button 
                  onClick={() => onNavigateTab('saved-docs')}
                  className="text-[10px] bg-white px-2.5 py-1 border border-slate-200 rounded font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                >
                  ARSIP ({totalDocs})
                </button>
                <button 
                  onClick={() => onNavigateTab('kbc-10')}
                  className="text-[10px] bg-emerald-600 text-white px-2.5 py-1 rounded font-semibold hover:bg-emerald-500 transition-colors shadow-2xs"
                >
                  KBC MODE
                </button>
              </div>
            </div>

            {/* Generator Grid & Preview */}
            <div className="p-4 flex flex-col md:flex-row gap-4">
              {/* Generator Buttons Grid */}
              <div className="md:w-1/2 flex flex-col gap-3">
                <div>
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Administrasi Merdeka (ADM)
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onNavigateTab('adm-merdeka')}
                      className="text-left p-2.5 border border-slate-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50/50 transition-all group"
                    >
                      <div className="text-[9px] font-bold text-slate-400 group-hover:text-indigo-600">ADM-CP</div>
                      <div className="text-xs font-semibold text-slate-800">Capaian Pembelajaran</div>
                    </button>
                    <button
                      onClick={() => onNavigateTab('adm-merdeka')}
                      className="text-left p-2.5 border rounded-lg bg-indigo-50/80 border-indigo-200 hover:border-indigo-400 transition-all"
                    >
                      <div className="text-[9px] font-bold text-indigo-600">ADM-TP</div>
                      <div className="text-xs font-semibold text-slate-900">Tujuan Pembelajaran</div>
                    </button>
                    <button
                      onClick={() => onNavigateTab('adm-merdeka')}
                      className="text-left p-2.5 border border-slate-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50/50 transition-all group"
                    >
                      <div className="text-[9px] font-bold text-slate-400 group-hover:text-indigo-600">ADM-ATP</div>
                      <div className="text-xs font-semibold text-slate-800">Alur Tujuan (ATP)</div>
                    </button>
                    <button
                      onClick={() => onNavigateTab('adm-merdeka')}
                      className="text-left p-2.5 border border-slate-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50/50 transition-all group"
                    >
                      <div className="text-[9px] font-bold text-slate-400 group-hover:text-indigo-600">ADM-PROTA</div>
                      <div className="text-xs font-semibold text-slate-800">Program Tahunan</div>
                    </button>
                    <button
                      onClick={() => onNavigateTab('adm-merdeka')}
                      className="text-left p-2.5 border border-slate-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50/50 transition-all group"
                    >
                      <div className="text-[9px] font-bold text-slate-400 group-hover:text-indigo-600">ADM-PROSEM</div>
                      <div className="text-xs font-semibold text-slate-800">Program Semester</div>
                    </button>
                    <button
                      onClick={() => onNavigateTab('adm-merdeka')}
                      className="text-left p-2.5 border border-slate-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50/50 transition-all group"
                    >
                      <div className="text-[9px] font-bold text-slate-400 group-hover:text-indigo-600">ADM-KKTP</div>
                      <div className="text-xs font-semibold text-slate-800">Kriteria Capaian</div>
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-2 mt-1">
                    Kurikulum Berbasis Cinta & Deep Learning
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onNavigateTab('kbc-10')}
                      className="text-left p-2.5 border border-emerald-200 bg-emerald-50/60 rounded-lg hover:border-emerald-400 transition-all"
                    >
                      <div className="text-[9px] font-bold text-emerald-700">MODUL-KBC</div>
                      <div className="text-xs font-semibold text-slate-900">Modul Deep Learning</div>
                    </button>
                    <button
                      onClick={() => onNavigateTab('kbc-10')}
                      className="text-left p-2.5 border border-slate-200 rounded-lg hover:border-emerald-400 hover:bg-emerald-50/40 transition-all"
                    >
                      <div className="text-[9px] font-bold text-slate-400">LKPD-KBC</div>
                      <div className="text-xs font-semibold text-slate-800">Lembar Kerja Empati</div>
                    </button>
                    <button
                      onClick={() => onNavigateTab('deep-learning')}
                      className="text-left p-2.5 border border-purple-200 bg-purple-50/40 rounded-lg hover:border-purple-400 transition-all"
                    >
                      <div className="text-[9px] font-bold text-purple-700">DEEP-LEARN</div>
                      <div className="text-xs font-semibold text-slate-900">Mindful, Meaningful</div>
                    </button>
                    <button
                      onClick={() => onNavigateTab('deep-learning')}
                      className="text-left p-2.5 border border-slate-200 rounded-lg hover:border-purple-400 hover:bg-purple-50/40 transition-all"
                    >
                      <div className="text-[9px] font-bold text-slate-400">ASESMEN-HOTS</div>
                      <div className="text-xs font-semibold text-slate-800">Kisi & Soal Sumatif</div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Document Preview Box */}
              <div className="md:w-1/2 bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col overflow-hidden shadow-inner">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold bg-white px-2 py-0.5 border border-slate-200 rounded text-slate-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    PREVIEW STANDAR DOKUMEN
                  </span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                    <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                    <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                  </div>
                </div>

                <div className="flex-1 bg-white p-3.5 shadow-2xs border border-slate-200 rounded-lg text-[10.5px] font-serif leading-relaxed text-slate-800 max-h-72 overflow-y-auto">
                  <div className="text-center font-bold mb-3 border-b-2 border-double border-slate-800 pb-1.5 uppercase">
                    TUJUAN PEMBELAJARAN (ADM-TP)<br />
                    TAHUN PELAJARAN {schoolConfig.tahunPelajaran}
                  </div>
                  <table className="w-full border-collapse mb-3 text-[10px]">
                    <thead>
                      <tr className="bg-slate-100 font-sans">
                        <th className="border border-slate-400 p-1">Kode</th>
                        <th className="border border-slate-400 p-1 text-left">Elemen</th>
                        <th className="border border-slate-400 p-1 text-left">Tujuan Pembelajaran</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-300 p-1 text-center font-mono font-bold text-indigo-700">TP.7.1</td>
                        <td className="border border-slate-300 p-1 font-sans">Bilangan Bulat</td>
                        <td className="border border-slate-300 p-1">Menganalisis dan mengoperasikan penjumlahan serta pengurangan bilangan bulat dalam konteks nyata.</td>
                      </tr>
                      <tr>
                        <td className="border border-slate-300 p-1 text-center font-mono font-bold text-indigo-700">TP.7.2</td>
                        <td className="border border-slate-300 p-1 font-sans">Panca Cinta KBC</td>
                        <td className="border border-slate-300 p-1">Menginternalisasi nilai Cinta Ilmu dan Cinta Teman melalui kolaborasi pemecahan masalah kontekstual.</td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="mt-4 pt-2">
                    <table className="w-full" style={{ border: 'none' }}>
                      <tbody>
                        <tr style={{ border: 'none' }}>
                          <td style={{ border: 'none', width: '50%', verticalAlign: 'top', textAlign: 'center' }}>
                            Mengetahui,<br />
                            <strong>Kepala Sekolah</strong><br /><br /><br />
                            <strong><u>{schoolConfig.namaKepsek}</u></strong><br />
                            <span>NIP. {schoolConfig.nipKepsek}</span>
                          </td>
                          <td style={{ border: 'none', width: '50%', verticalAlign: 'top', textAlign: 'center' }}>
                            {schoolConfig.tempatTanggalTtd || 'Jakarta, 14 Agustus 2026'}<br />
                            <strong>Guru Pengampu</strong><br /><br /><br />
                            <strong><u>{currentUser.nama}</u></strong><br />
                            <span>NIP. {currentUser.nip || '-'}</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Agenda/Journal Panel & Quick Export */}
        <div className="w-full lg:w-80 flex flex-col gap-4 shrink-0">
          {/* Agenda & Jurnal Guru */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-xs p-3.5 flex flex-col">
            <h3 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-2.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                AGENDA & JURNAL GURU
              </span>
              <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">HARI INI</span>
            </h3>

            <div className="space-y-2 max-h-56 overflow-y-auto">
              <div className="p-2.5 bg-slate-50 rounded-lg border-l-4 border-indigo-500">
                <div className="text-[10px] font-bold text-indigo-600">Kelas VII-A | Jam 1-2</div>
                <div className="text-xs font-bold text-slate-900 leading-tight mt-0.5">Bilangan Bulat & Nilai Panca Cinta</div>
                <div className="text-[10px] text-emerald-600 font-medium mt-1">Status: Selesai Dilaksanakan</div>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <div className="text-[10px] font-bold text-slate-400">Kelas VII-B | Jam 4-5</div>
                <div className="text-xs font-bold text-slate-800 leading-tight mt-0.5">Operasi Aljabar Sederhana</div>
                <div className="text-[10px] text-slate-500 mt-1">Status: Terjadwal</div>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <div className="text-[10px] font-bold text-slate-400">Kelas VIII-A | Jam 7-8</div>
                <div className="text-xs font-bold text-slate-800 leading-tight mt-0.5">Refleksi KBC & Tutor Sebaya</div>
                <div className="text-[10px] text-slate-500 mt-1">Status: Terjadwal</div>
              </div>
            </div>

            <button 
              onClick={() => onNavigateTab('journal')}
              className="w-full mt-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold rounded-lg uppercase tracking-wider transition-colors shadow-xs"
            >
              BUKA JURNAL LENGKAP
            </button>
          </section>

          {/* Quick Export Panel in Deep Indigo */}
          <section className="bg-[#1e1b4b] text-white rounded-xl shadow-md p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-0.5">
              <div className="p-1 bg-indigo-500/20 rounded">
                <Clock className="w-4 h-4 text-indigo-400" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-200">
                QUICK EXPORT FORMAT
              </h3>
            </div>

            <p className="text-[11px] text-indigo-200/80 leading-relaxed">
              Format standar otomatis terisi Kop Resmi, Font Times New Roman 11pt, dan TTD 2 Kolom Sejajar.
            </p>

            <div className="flex flex-col gap-2">
              <button 
                onClick={() => onNavigateTab('saved-docs')}
                className="flex items-center justify-between p-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium transition-colors"
              >
                <span className="flex items-center gap-2">
                  <FileCheck className="w-3.5 h-3.5 text-rose-400" /> PDF (.pdf)
                </span>
                <span className="text-[9px] font-bold bg-rose-500 text-white px-1.5 py-0.5 rounded uppercase">Cetak</span>
              </button>

              <button 
                onClick={() => onNavigateTab('saved-docs')}
                className="flex items-center justify-between p-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium transition-colors"
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-blue-400" /> MS WORD (.doc)
                </span>
                <span className="text-[9px] font-bold bg-blue-500 text-white px-1.5 py-0.5 rounded uppercase">Export</span>
              </button>
            </div>

            <div className="mt-1 p-2.5 bg-indigo-950/80 border border-indigo-800/50 rounded-lg">
              <div className="flex justify-between items-center mb-1 text-[10px]">
                <span className="font-bold text-indigo-300 uppercase tracking-wider">AI Gemini Quota</span>
                <span className="font-bold text-emerald-400">100% Aktif</span>
              </div>
              <div className="w-full bg-indigo-950 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full w-[95%] rounded-full"></div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
