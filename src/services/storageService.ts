import {
  SchoolConfig,
  User,
  Student,
  ClassItem,
  AttendanceRecord,
  TeacherJournal,
  GradeRecord,
  HomeroomGuidance,
  GeneratedDocument,
} from '../types';

const STORAGE_KEYS = {
  CONFIG: 'kbc_school_config_v2',
  USERS: 'kbc_users_v2',
  STUDENTS: 'kbc_students_v2',
  CLASSES: 'kbc_classes_v2',
  ATTENDANCE: 'kbc_attendance_v2',
  JOURNALS: 'kbc_journals_v2',
  GRADES: 'kbc_grades_v2',
  HOMEROOM_GUIDANCE: 'kbc_homeroom_guidance_v2',
  DOCUMENTS: 'kbc_documents_v2',
  CURRENT_USER: 'kbc_active_user',
};

export const DEFAULT_SCHOOL_CONFIG: SchoolConfig = {
  namaInstansi: 'PEMERINTAH DAERAH PROVINSI DKI JAKARTA / DINAS PENDIDIKAN',
  namaSekolah: 'SMP BINA INSAN CINTA & KARAKTER BANGSA',
  alamat: 'Jl. Pendidikan Karakter Terpadu No. 88, Tebet, Jakarta Selatan. Telp: (021) 8294711',
  tempatTanggalTtd: 'Jakarta, 14 Agustus 2026',
  namaKepsek: 'Dr. H. Ahmad Fauzan, M.Pd.',
  nipKepsek: '19760514 200112 1 003',
  tahunPelajaran: '2025/2026',
  semesterAktif: 'Ganjil',
  kurikulumUtama: 'Kurikulum Merdeka & Kurikulum Berbasis Cinta (KBC)',
  websiteOrEmail: 'info@smpbinainsankbc.sch.id',
};

export const DEFAULT_USERS: User[] = [
  {
    id: 'u-admin-1',
    username: 'admin',
    password: 'admin123',
    nama: 'Dr. H. Ahmad Fauzan, M.Pd.',
    nip: '19760514 200112 1 003',
    role: 'admin',
    mapel: 'Manajemen Pendidikan & Semua Mapel',
    email: 'admin@smpbinainsankbc.sch.id',
  },
  {
    id: 'u-guru-1',
    username: 'guru1',
    password: 'guru123',
    nama: 'Siti Rahmawati, S.Pd., M.Si.',
    nip: '19840315 200801 2 007',
    role: 'guru',
    mapel: 'Matematika',
    email: 'siti.rahma@smpbinainsankbc.sch.id',
  },
  {
    id: 'u-guru-2',
    username: 'guru2',
    password: 'guru123',
    nama: 'Muhammad Ihsan, S.Pd.I.',
    nip: '19890912 201402 1 004',
    role: 'guru',
    mapel: 'Pendidikan Agama Islam & Budi Pekerti',
    email: 'm.ihsan@smpbinainsankbc.sch.id',
  },
  {
    id: 'u-wali-1',
    username: 'walikelas',
    password: 'wali123',
    nama: 'Budi Santoso, S.Pd.',
    nip: '19820710 200604 1 009',
    role: 'walikelas',
    mapel: 'Bahasa Indonesia',
    kelasBinaan: 'Kelas VII-A',
    email: 'budi.santoso@smpbinainsankbc.sch.id',
  },
];

export const DEFAULT_CLASSES: ClassItem[] = [
  {
    id: 'c-7a',
    namaKelas: 'Kelas VII-A',
    fase: 'Fase D',
    tingkat: 7,
    waliKelasId: 'u-wali-1',
    waliKelasNama: 'Budi Santoso, S.Pd.',
    tahunAjaran: '2025/2026',
    jumlahSiswa: 32,
  },
  {
    id: 'c-7b',
    namaKelas: 'Kelas VII-B',
    fase: 'Fase D',
    tingkat: 7,
    waliKelasId: 'u-guru-2',
    waliKelasNama: 'Muhammad Ihsan, S.Pd.I.',
    tahunAjaran: '2025/2026',
    jumlahSiswa: 30,
  },
  {
    id: 'c-8a',
    namaKelas: 'Kelas VIII-A',
    fase: 'Fase D',
    tingkat: 8,
    waliKelasId: 'u-guru-1',
    waliKelasNama: 'Siti Rahmawati, S.Pd., M.Si.',
    tahunAjaran: '2025/2026',
    jumlahSiswa: 32,
  },
  {
    id: 'c-9a',
    namaKelas: 'Kelas IX-A',
    fase: 'Fase D',
    tingkat: 9,
    waliKelasId: 'u-admin-1',
    waliKelasNama: 'Dr. H. Ahmad Fauzan, M.Pd.',
    tahunAjaran: '2025/2026',
    jumlahSiswa: 28,
  },
];

export const DEFAULT_STUDENTS: Student[] = [
  { id: 's-1', nisn: '0089234511', nis: '247001', nama: 'Abimanyu Danendra Pratama', kelas: 'Kelas VII-A', jenisKelamin: 'L', agama: 'Islam', namaOrtu: 'Danang Pratama', noHpOrtu: '081234567801', alamat: 'Tebet Timur Dalam No. 12' },
  { id: 's-2', nisn: '0089234512', nis: '247002', nama: 'Adiba Shakila Atmarini', kelas: 'Kelas VII-A', jenisKelamin: 'P', agama: 'Islam', namaOrtu: 'H. Bambang S.', noHpOrtu: '081234567802', alamat: 'Manggarai Selatan No. 5' },
  { id: 's-3', nisn: '0089234513', nis: '247003', nama: 'Alif Zaidan Al-Farisi', kelas: 'Kelas VII-A', jenisKelamin: 'L', agama: 'Islam', namaOrtu: 'Farhan Al-Farisi', noHpOrtu: '081234567803', alamat: 'Pancoran Indah No. 8' },
  { id: 's-4', nisn: '0089234514', nis: '247004', nama: 'Anindya Kirana Larasati', kelas: 'Kelas VII-A', jenisKelamin: 'P', agama: 'Islam', namaOrtu: 'Surya Larasati', noHpOrtu: '081234567804', alamat: 'Bukit Duri No. 19' },
  { id: 's-5', nisn: '0089234515', nis: '247005', nama: 'Bryan Christian Sinaga', kelas: 'Kelas VII-A', jenisKelamin: 'L', agama: 'Kristen', namaOrtu: 'Toga Sinaga', noHpOrtu: '081234567805', alamat: 'Kalibata City Tower F' },
  { id: 's-6', nisn: '0089234516', nis: '247006', nama: 'Cantika Putri Maharani', kelas: 'Kelas VII-A', jenisKelamin: 'P', agama: 'Islam', namaOrtu: 'Agus Maharani', noHpOrtu: '081234567806', alamat: 'Tebet Barat VII No. 2' },
  { id: 's-7', nisn: '0089234517', nis: '247007', nama: 'Daffa Rizky Ramadhan', kelas: 'Kelas VII-A', jenisKelamin: 'L', agama: 'Islam', namaOrtu: 'Rudy Ramadhan', noHpOrtu: '081234567807', alamat: 'Cikoko Barat No. 33' },
  { id: 's-8', nisn: '0089234518', nis: '247008', nama: 'Fatimah Az-Zahra', kelas: 'Kelas VII-A', jenisKelamin: 'P', agama: 'Islam', namaOrtu: 'Habib Sholeh', noHpOrtu: '081234567808', alamat: 'Gatot Subroto No. 40' },
  { id: 's-9', nisn: '0089234519', nis: '247009', nama: 'Galih Rakha Wicaksana', kelas: 'Kelas VII-A', jenisKelamin: 'L', agama: 'Islam', namaOrtu: 'Wicaksana Eko', noHpOrtu: '081234567809', alamat: 'Menteng Dalam No. 11' },
  { id: 's-10', nisn: '0089234520', nis: '247010', nama: 'Hana Clarissa Putri', kelas: 'Kelas VII-A', jenisKelamin: 'P', agama: 'Katolik', namaOrtu: 'Fransiskus X.', noHpOrtu: '081234567810', alamat: 'Kuningan Barat No. 14' },
];

export const DEFAULT_GRADES: GradeRecord[] = DEFAULT_STUDENTS.map((s, idx) => {
  const base = 80 + (idx % 15);
  const tp1 = Math.min(98, base + 2);
  const tp2 = Math.min(95, base + 4);
  const tp3 = Math.min(96, base + 1);
  const tp4 = Math.min(97, base + 3);
  const lm1 = Math.min(96, base + 2);
  const lm2 = Math.min(94, base + 3);
  const lm3 = Math.min(98, base + 5);
  const sas = Math.min(96, base + 2);
  const avgFormatif = (tp1 + tp2 + tp3 + tp4) / 4;
  const avgSumatifLM = (lm1 + lm2 + lm3) / 3;
  const na = Math.round(avgFormatif * 0.3 + avgSumatifLM * 0.4 + sas * 0.3);
  const predikat = na >= 90 ? 'A' : na >= 80 ? 'B' : na >= 70 ? 'C' : 'D';
  const deskripsi =
    na >= 85
      ? 'Menunjukkan penguasaan sangat baik dalam penalaran kritis dan penghayatan nilai-nilai Panca Cinta dengan teladan yang mulia.'
      : 'Menunjukkan pemahaman yang memadai terhadap materi dan aktif berkolaborasi dalam menyelesaikan tugas kelompok.';

  return {
    studentId: s.id,
    studentName: s.nama,
    nisn: s.nisn,
    kelas: s.kelas,
    mapel: 'Matematika',
    semester: 'Ganjil',
    tahunPelajaran: '2025/2026',
    grades: {
      tp1,
      tp2,
      tp3,
      tp4,
      avgFormatif: Math.round(avgFormatif * 10) / 10,
      sumatifLM1: lm1,
      sumatifLM2: lm2,
      sumatifLM3: lm3,
      avgSumatifLM: Math.round(avgSumatifLM * 10) / 10,
      sas,
      nilaiAkhir: na,
      predikat,
      deskripsiCapaian: deskripsi,
    },
  };
});

export const DEFAULT_GUIDANCES: HomeroomGuidance[] = [
  {
    id: 'gui-1',
    waliKelasId: 'u-wali-1',
    waliKelasName: 'Budi Santoso, S.Pd.',
    kelas: 'Kelas VII-A',
    studentId: 's-7',
    studentName: 'Daffa Rizky Ramadhan',
    nisn: '0089234517',
    tanggal: '2026-08-12',
    jenisBimbingan: 'Sosial / Kedisiplinan',
    masalahKejadian: 'Terlambat masuk sekolah 3 kali dalam seminggu karena keterlambatan angkutan umum.',
    tindakLanjutSolusi: 'Dilakukan dialog empatik, disepakati penyesuaian jam bangun dan memilih rute alternatif.',
    keteranganStatus: 'Selesai',
  },
  {
    id: 'gui-2',
    waliKelasId: 'u-wali-1',
    waliKelasName: 'Budi Santoso, S.Pd.',
    kelas: 'Kelas VII-A',
    studentId: 's-1',
    studentName: 'Abimanyu Danendra Pratama',
    nisn: '0089234511',
    tanggal: '2026-08-14',
    jenisBimbingan: 'Karakter & KBC',
    masalahKejadian: 'Menunjukkan inisiatif tinggi membantu teman yang kesulitan memahami materi aljabar.',
    tindakLanjutSolusi: 'Diberikan apresiasi sebagai Duta Kasih Sebaya dan ditunjuk menjadi tutor sebaya kelompok.',
    keteranganStatus: 'Selesai',
  },
];

export const DEFAULT_JOURNALS: TeacherJournal[] = [
  {
    id: 'j-1',
    tanggal: '2026-08-14',
    guruId: 'u-guru-1',
    guruNama: 'Siti Rahmawati, S.Pd., M.Si.',
    mapel: 'Matematika',
    kelas: 'Kelas VII-A',
    jamKe: '1 - 2 (07.30 - 09.00)',
    materiPokok: 'Bilangan Bulat & Penerapan dalam Kehidupan Sehari-hari',
    tujuanPembelajaran: 'Peserta didik mampu mengoperasikan penjumlahan dan pengurangan bilangan bulat dengan pemahaman bernalar kritis dan cinta ilmu pengetahuan.',
    kegiatanPembelajaran: 'Model Problem Based Learning: Orientasi masalah kedalaman suhu es dan ketinggian daratan, eksplorasi kartu bilangan berpasangan, diskusi kelompok.',
    refleksiDanTindakLanjut: '90% siswa tuntas aktif, 3 siswa butuh scaffolding pengalian bilangan negatif.',
    jumlahHadir: 31,
    jumlahTidakHadir: 1,
    status: 'Selesai',
  },
];

// Helper Functions
export function loadSchoolConfig(): SchoolConfig {
  const raw = localStorage.getItem(STORAGE_KEYS.CONFIG);
  if (!raw) {
    saveSchoolConfig(DEFAULT_SCHOOL_CONFIG);
    return DEFAULT_SCHOOL_CONFIG;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return DEFAULT_SCHOOL_CONFIG;
  }
}

export function saveSchoolConfig(config: SchoolConfig): void {
  localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
}

export function loadUsers(): User[] {
  const raw = localStorage.getItem(STORAGE_KEYS.USERS);
  if (!raw) {
    saveUsers(DEFAULT_USERS);
    return DEFAULT_USERS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return DEFAULT_USERS;
  }
}

export function saveUsers(users: User[]): void {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

export function loadStudents(): Student[] {
  const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
  if (!raw) {
    saveStudents(DEFAULT_STUDENTS);
    return DEFAULT_STUDENTS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return DEFAULT_STUDENTS;
  }
}

export function saveStudents(students: Student[]): void {
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
}

export function loadClasses(): ClassItem[] {
  const raw = localStorage.getItem(STORAGE_KEYS.CLASSES);
  if (!raw) {
    saveClasses(DEFAULT_CLASSES);
    return DEFAULT_CLASSES;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return DEFAULT_CLASSES;
  }
}

export function saveClasses(classes: ClassItem[]): void {
  localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
}

export function loadAttendanceRecords(): AttendanceRecord[] {
  const raw = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveAttendanceRecords(records: AttendanceRecord[]): void {
  localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));
}

export function loadGrades(): GradeRecord[] {
  const raw = localStorage.getItem(STORAGE_KEYS.GRADES);
  if (!raw) {
    saveGrades(DEFAULT_GRADES);
    return DEFAULT_GRADES;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return DEFAULT_GRADES;
  }
}

export function saveGrades(grades: GradeRecord[]): void {
  localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify(grades));
}

export function loadTeacherJournals(): TeacherJournal[] {
  const raw = localStorage.getItem(STORAGE_KEYS.JOURNALS);
  if (!raw) {
    saveTeacherJournals(DEFAULT_JOURNALS);
    return DEFAULT_JOURNALS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveTeacherJournals(journals: TeacherJournal[]): void {
  localStorage.setItem(STORAGE_KEYS.JOURNALS, JSON.stringify(journals));
}

export function loadHomeroomGuidances(): HomeroomGuidance[] {
  const raw = localStorage.getItem(STORAGE_KEYS.HOMEROOM_GUIDANCE);
  if (!raw) {
    saveHomeroomGuidances(DEFAULT_GUIDANCES);
    return DEFAULT_GUIDANCES;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveHomeroomGuidances(guidances: HomeroomGuidance[]): void {
  localStorage.setItem(STORAGE_KEYS.HOMEROOM_GUIDANCE, JSON.stringify(guidances));
}

export function loadDocuments(): GeneratedDocument[] {
  const raw = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveDocumentToDb(doc: GeneratedDocument): void {
  const all = loadDocuments();
  const idx = all.findIndex((d) => d.id === doc.id);
  if (idx >= 0) {
    all[idx] = doc;
  } else {
    all.unshift(doc);
  }
  localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(all));
}

export function deleteDocumentFromDb(docId: string): void {
  const all = loadDocuments().filter((d) => d.id !== docId);
  localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(all));
}

export function resetToDefaultData(): void {
  localStorage.clear();
  saveSchoolConfig(DEFAULT_SCHOOL_CONFIG);
  saveUsers(DEFAULT_USERS);
  saveClasses(DEFAULT_CLASSES);
  saveStudents(DEFAULT_STUDENTS);
  saveGrades(DEFAULT_GRADES);
  saveTeacherJournals(DEFAULT_JOURNALS);
  saveHomeroomGuidances(DEFAULT_GUIDANCES);
}

// Global storage object for backwards compatibility
export const storage = {
  getConfig: loadSchoolConfig,
  saveConfig: saveSchoolConfig,
  getUsers: loadUsers,
  saveUsers: saveUsers,
  getStudents: loadStudents,
  saveStudents: saveStudents,
  getClasses: loadClasses,
  saveClasses: saveClasses,
  getAttendance: loadAttendanceRecords,
  saveAttendance: saveAttendanceRecords,
  getJournals: loadTeacherJournals,
  saveJournals: saveTeacherJournals,
  getGrades: loadGrades,
  saveGrades: saveGrades,
  getHomeroomLogs: loadHomeroomGuidances,
  saveHomeroomLogs: saveHomeroomGuidances,
  getDocuments: loadDocuments,
  saveDocument: saveDocumentToDb,
  deleteDocument: deleteDocumentFromDb,
  resetDatabase: resetToDefaultData,
};
