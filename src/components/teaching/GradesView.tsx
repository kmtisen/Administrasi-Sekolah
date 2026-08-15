import React, { useState } from 'react';
import {
  GraduationCap,
  Save,
  Download,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { Student, ClassItem, GradeRecord, User, SchoolConfig } from '../../types';

interface GradesViewProps {
  students: Student[];
  classes: ClassItem[];
  currentUser: User;
  schoolConfig: SchoolConfig;
  grades: GradeRecord[];
  onSaveGrades: (grades: GradeRecord[]) => void;
}

export const GradesView: React.FC<GradesViewProps> = ({
  students,
  classes,
  currentUser,
  schoolConfig,
  grades,
  onSaveGrades,
}) => {
  const [selectedClass, setSelectedClass] = useState<string>(
    currentUser.kelasBinaan || classes[0]?.namaKelas || 'Kelas VII-A'
  );
  const [selectedSemester, setSelectedSemester] = useState<string>(schoolConfig.semesterAktif);
  const [kktpThreshold, setKktpThreshold] = useState<number>(75);

  const classStudents = students.filter((s) => s.kelas === selectedClass);

  // Local table state: studentId -> GradeRecord values
  const [localGrades, setLocalGrades] = useState<{ [studentId: string]: Partial<GradeRecord> }>(
    () => {
      const map: { [studentId: string]: Partial<GradeRecord> } = {};
      classStudents.forEach((s) => {
        const existing = grades.find(
          (g) =>
            g.studentId === s.id &&
            g.mapel === currentUser.mapel &&
            g.semester === selectedSemester
        );
        map[s.id] = existing || {
          studentId: s.id,
          studentName: s.nama,
          nisn: s.nisn,
          kelas: selectedClass,
          mapel: currentUser.mapel,
          guruId: currentUser.id,
          semester: selectedSemester,
          formatif1: 80,
          formatif2: 82,
          formatif3: 85,
          formatif4: 80,
          sumatifLm1: 82,
          sumatifLm2: 84,
          sumatifAkhirSemester: 85,
        };
      });
      return map;
    }
  );

  const handleScoreChange = (
    studentId: string,
    field: keyof GradeRecord,
    val: number
  ) => {
    const clamped = Math.max(0, Math.min(100, isNaN(val) ? 0 : val));
    setLocalGrades((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: clamped,
      },
    }));
  };

  const calculateFinalScore = (rec: Partial<GradeRecord>) => {
    const f1 = rec.formatif1 || 0;
    const f2 = rec.formatif2 || 0;
    const f3 = rec.formatif3 || 0;
    const f4 = rec.formatif4 || 0;
    const avgFormatif = (f1 + f2 + f3 + f4) / 4;

    const slm1 = rec.sumatifLm1 || 0;
    const slm2 = rec.sumatifLm2 || 0;
    const avgSumatifLm = (slm1 + slm2) / 2;

    const sas = rec.sumatifAkhirSemester || 0;

    // Weighting: 30% Formatif, 40% Sumatif LM, 30% SAS
    const finalScore = Math.round(avgFormatif * 0.3 + avgSumatifLm * 0.4 + sas * 0.3);
    return finalScore;
  };

  const handleSaveAll = () => {
    const otherGrades = grades.filter(
      (g) =>
        !(
          g.kelas === selectedClass &&
          g.mapel === currentUser.mapel &&
          g.semester === selectedSemester
        )
    );

    const updatedCurrent: GradeRecord[] = classStudents.map((s) => {
      const rec = localGrades[s.id] || {};
      const nilaiAkhir = calculateFinalScore(rec);
      const isPassed = nilaiAkhir >= kktpThreshold;
      const deskripsiCapaian = isPassed
        ? `Menunjukkan penguasaan yang sangat baik dalam seluruh materi ${currentUser.mapel} dan pembiasaan nilai karakter yang terpuji.`
        : `Perlu bimbingan dan penguatan lebih intensif pada pemahaman konsep dan pengerjaan tugas ${currentUser.mapel}.`;

      const predikat = nilaiAkhir >= 88 ? 'A' : nilaiAkhir >= 78 ? 'B' : nilaiAkhir >= 68 ? 'C' : 'D';

      return {
        id: `grd-${s.id}-${currentUser.mapel}-${selectedSemester}`,
        studentId: s.id,
        studentName: s.nama,
        nisn: s.nisn,
        kelas: selectedClass,
        mapel: currentUser.mapel,
        guruId: currentUser.id,
        semester: selectedSemester,
        tahunPelajaran: schoolConfig.tahunPelajaran,
        formatif1: rec.formatif1 || 0,
        formatif2: rec.formatif2 || 0,
        formatif3: rec.formatif3 || 0,
        formatif4: rec.formatif4 || 0,
        sumatifLm1: rec.sumatifLm1 || 0,
        sumatifLm2: rec.sumatifLm2 || 0,
        sumatifAkhirSemester: rec.sumatifAkhirSemester || 0,
        nilaiAkhir,
        deskripsiCapaian,
        grades: {
          tp1: rec.formatif1 || 0,
          tp2: rec.formatif2 || 0,
          tp3: rec.formatif3 || 0,
          tp4: rec.formatif4 || 0,
          sumatifLM1: rec.sumatifLm1 || 0,
          sumatifLM2: rec.sumatifLm2 || 0,
          sumatifLM3: 0,
          sas: rec.sumatifAkhirSemester || 0,
          nilaiAkhir,
          predikat,
          deskripsiCapaian,
        },
      };
    });

    onSaveGrades([...otherGrades, ...updatedCurrent]);

    Swal.fire({
      icon: 'success',
      title: 'Nilai Berhasil Disimpan!',
      text: `Nilai mata pelajaran ${currentUser.mapel} kelas ${selectedClass} berhasil diperbarui.`,
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const handleExportExcel = () => {
    const exportRows = classStudents.map((s, idx) => {
      const rec = localGrades[s.id] || {};
      const na = calculateFinalScore(rec);
      return {
        No: idx + 1,
        NISN: s.nisn,
        'Nama Siswa': s.nama,
        Kelas: selectedClass,
        'Mata Pelajaran': currentUser.mapel,
        Semester: selectedSemester,
        'Formatif TP 1': rec.formatif1 || 0,
        'Formatif TP 2': rec.formatif2 || 0,
        'Formatif TP 3': rec.formatif3 || 0,
        'Formatif TP 4': rec.formatif4 || 0,
        'Sumatif LM 1': rec.sumatifLm1 || 0,
        'Sumatif LM 2': rec.sumatifLm2 || 0,
        'Sumatif Akhir Semester': rec.sumatifAkhirSemester || 0,
        'Nilai Akhir (NA)': na,
        'Status KKTP': na >= kktpThreshold ? 'TUNTAS' : 'REMEDIAL',
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Nilai_Siswa');
    XLSX.writeFile(wb, `Rekap_Nilai_${currentUser.mapel}_${selectedClass}_Smt_${selectedSemester}.xlsx`);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Input Nilai & Asesmen (Formatif & Sumatif)
            </h1>
            <p className="text-xs text-slate-500">
              Pengolahan nilai Kurikulum Merdeka: Formatif TP 1-4, Sumatif Lingkup Materi, Sumatif Akhir (SAS), dan Ketercapaian KKTP.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-300 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Export Nilai Excel
          </button>

          <button
            onClick={handleSaveAll}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-950/20 transition-all"
          >
            <Save className="w-4 h-4" />
            Simpan Nilai
          </button>
        </div>
      </div>

      {/* Filter & Parameters */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="block font-bold text-slate-700 uppercase mb-1">Pilih Kelas</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.namaKelas}>
                {c.namaKelas} ({c.fase})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-700 uppercase mb-1">Mata Pelajaran</label>
          <input
            type="text"
            readOnly
            value={currentUser.mapel}
            className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-700 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 uppercase mb-1">Semester</label>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="Ganjil">Semester Ganjil</option>
            <option value="Genap">Semester Genap</option>
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-700 uppercase mb-1">KKTP Minimum</label>
          <input
            type="number"
            min={50}
            max={100}
            value={kktpThreshold}
            onChange={(e) => setKktpThreshold(Number(e.target.value))}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Grades Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-center">
              <tr>
                <th rowSpan={2} className="p-3 pl-4 w-10">No</th>
                <th rowSpan={2} className="p-3 text-left">Nama Peserta Didik</th>
                <th colSpan={4} className="p-2 border-l border-b border-slate-200 bg-emerald-50/70 text-emerald-900">
                  Asesmen Formatif (TP 1 - 4)
                </th>
                <th colSpan={2} className="p-2 border-l border-b border-slate-200 bg-blue-50/70 text-blue-900">
                  Sumatif Lingkup Materi
                </th>
                <th rowSpan={2} className="p-3 border-l border-slate-200 bg-purple-50/70 text-purple-900 w-20">
                  SAS / ASAS
                </th>
                <th rowSpan={2} className="p-3 border-l border-slate-200 bg-amber-50/70 text-amber-950 w-20">
                  Nilai Akhir (NA)
                </th>
                <th rowSpan={2} className="p-3 pr-4 border-l border-slate-200">
                  Status KKTP
                </th>
              </tr>
              <tr className="bg-slate-100 text-[10px] text-slate-600">
                <th className="p-1.5 border-l border-slate-200 w-14">TP 1</th>
                <th className="p-1.5 w-14">TP 2</th>
                <th className="p-1.5 w-14">TP 3</th>
                <th className="p-1.5 w-14">TP 4</th>
                <th className="p-1.5 border-l border-slate-200 w-16">SLM 1</th>
                <th className="p-1.5 w-16">SLM 2</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classStudents.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-slate-400">
                    Belum ada siswa di {selectedClass}.
                  </td>
                </tr>
              ) : (
                classStudents.map((s, idx) => {
                  const rec = localGrades[s.id] || {};
                  const na = calculateFinalScore(rec);
                  const isPassed = na >= kktpThreshold;

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-2.5 pl-4 text-center font-bold text-slate-400">{idx + 1}</td>
                      <td className="p-2.5">
                        <div className="font-bold text-slate-900">{s.nama}</div>
                        <div className="text-[10px] text-slate-400 font-mono">NISN: {s.nisn}</div>
                      </td>

                      {/* Formatif Inputs */}
                      <td className="p-1.5 text-center border-l border-slate-100">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={rec.formatif1 ?? ''}
                          onChange={(e) => handleScoreChange(s.id, 'formatif1', Number(e.target.value))}
                          className="w-12 text-center p-1 font-semibold text-slate-800 bg-emerald-50/30 rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </td>
                      <td className="p-1.5 text-center">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={rec.formatif2 ?? ''}
                          onChange={(e) => handleScoreChange(s.id, 'formatif2', Number(e.target.value))}
                          className="w-12 text-center p-1 font-semibold text-slate-800 bg-emerald-50/30 rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </td>
                      <td className="p-1.5 text-center">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={rec.formatif3 ?? ''}
                          onChange={(e) => handleScoreChange(s.id, 'formatif3', Number(e.target.value))}
                          className="w-12 text-center p-1 font-semibold text-slate-800 bg-emerald-50/30 rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </td>
                      <td className="p-1.5 text-center">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={rec.formatif4 ?? ''}
                          onChange={(e) => handleScoreChange(s.id, 'formatif4', Number(e.target.value))}
                          className="w-12 text-center p-1 font-semibold text-slate-800 bg-emerald-50/30 rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </td>

                      {/* Sumatif LM Inputs */}
                      <td className="p-1.5 text-center border-l border-slate-100">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={rec.sumatifLm1 ?? ''}
                          onChange={(e) => handleScoreChange(s.id, 'sumatifLm1', Number(e.target.value))}
                          className="w-12 text-center p-1 font-semibold text-slate-800 bg-blue-50/30 rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>
                      <td className="p-1.5 text-center">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={rec.sumatifLm2 ?? ''}
                          onChange={(e) => handleScoreChange(s.id, 'sumatifLm2', Number(e.target.value))}
                          className="w-12 text-center p-1 font-semibold text-slate-800 bg-blue-50/30 rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </td>

                      {/* SAS Input */}
                      <td className="p-1.5 text-center border-l border-slate-100">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={rec.sumatifAkhirSemester ?? ''}
                          onChange={(e) => handleScoreChange(s.id, 'sumatifAkhirSemester', Number(e.target.value))}
                          className="w-12 text-center p-1 font-semibold text-slate-800 bg-purple-50/30 rounded border border-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                      </td>

                      {/* NA */}
                      <td className="p-2.5 text-center font-extrabold text-sm border-l border-slate-100 text-slate-900 bg-amber-50/40">
                        {na}
                      </td>

                      {/* Status KKTP */}
                      <td className="p-2.5 pr-4 text-center border-l border-slate-100">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isPassed
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {isPassed ? 'TUNTAS' : 'REMEDIAL'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
