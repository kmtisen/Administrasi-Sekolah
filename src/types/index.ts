export type UserRole = 'admin' | 'guru' | 'walikelas';

export interface User {
  id: string;
  username: string;
  password?: string;
  nama: string;
  nip: string;
  role: UserRole;
  mapel: string;
  kelasBinaan?: string; // For Wali Kelas
  email?: string;
  avatar?: string;
}

export interface SchoolConfig {
  namaInstansi: string; // e.g. "PEMERINTAH DAERAH PROVINSI DKI JAKARTA / DINAS PENDIDIKAN"
  namaSekolah: string;  // e.g. "SMP BINA INSAN CINTA & KARAKTER BANGSA"
  alamat: string;       // e.g. "Jl. Pendidikan Karakter Terpadu No. 88, Tebet, Jakarta Selatan"
  tempatTanggalTtd: string; // e.g. "Jakarta, 14 Agustus 2026"
  namaKepsek: string;
  nipKepsek: string;
  tahunPelajaran: string; // e.g. "2025/2026"
  semesterAktif: 'Ganjil' | 'Genap';
  kurikulumUtama: string; // e.g. "Kurikulum Merdeka & Kurikulum Berbasis Cinta (KBC)"
  websiteOrEmail?: string;
}

export interface Student {
  id: string;
  nisn: string;
  nis: string;
  nama: string;
  kelas: string;
  jenisKelamin: 'L' | 'P';
  agama: string;
  namaOrtu: string;
  noHpOrtu?: string;
  alamat?: string;
}

export interface ClassItem {
  id: string;
  namaKelas: string;
  fase: 'Fase A' | 'Fase B' | 'Fase C' | 'Fase D' | 'Fase E' | 'Fase F' | string;
  tingkat: number; // 7, 8, 9, 10, 11, 12, etc.
  waliKelasId: string;
  waliKelasNama: string;
  tahunAjaran: string;
  jumlahSiswa?: number;
}

export type AttendanceStatus = 'H' | 'I' | 'S' | 'A';

export interface AttendanceRecord {
  id: string;
  tanggal: string; // YYYY-MM-DD
  kelasId: string;
  kelasNama: string;
  mapel: string;
  guruId: string;
  guruNama: string;
  jamKe: string;
  materiPembelajaran: string;
  catatanKejadian: string;
  presensi: {
    studentId: string;
    studentName: string;
    status: AttendanceStatus;
    catatan?: string;
  }[];
  createdAt: string;
}

export interface TeacherJournal {
  id: string;
  tanggal: string;
  guruId: string;
  guruNama: string;
  mapel: string;
  kelas: string;
  jamKe: string;
  materiPokok: string;
  tujuanPembelajaran: string;
  kegiatanPembelajaran: string;
  refleksiDanTindakLanjut: string;
  jumlahHadir: number;
  jumlahTidakHadir: number;
  status: 'Selesai' | 'Berlangsung' | 'Direncanakan';
}

export interface GradeItem {
  tp1: number;
  tp2: number;
  tp3: number;
  tp4: number;
  avgFormatif?: number;
  sumatifLM1: number;
  sumatifLM2: number;
  sumatifLM3: number;
  avgSumatifLM?: number;
  sas: number; // Sumatif Akhir Semester
  nilaiAkhir: number;
  predikat: 'A' | 'B' | 'C' | 'D';
  deskripsiCapaian: string;
}

export interface StudentGradeRecord {
  id?: string;
  studentId: string;
  studentName: string;
  nisn: string;
  kelas: string;
  mapel: string;
  guruId?: string;
  semester: 'Ganjil' | 'Genap' | string;
  tahunPelajaran: string;
  grades: GradeItem;
  formatif1?: number;
  formatif2?: number;
  formatif3?: number;
  formatif4?: number;
  sumatifLm1?: number;
  sumatifLm2?: number;
  sumatifAkhirSemester?: number;
  nilaiAkhir?: number;
  deskripsiCapaian?: string;
}

// Alias for convenience
export type GradeRecord = StudentGradeRecord;

export interface HomeroomGuidance {
  id: string;
  waliKelasId: string;
  waliKelasName: string;
  kelas: string;
  studentId: string;
  studentName: string;
  nisn: string;
  tanggal: string;
  jenisBimbingan: 'Akademik' | 'Karakter & KBC' | 'Sosial / Kedisiplinan' | 'Pribadi' | string;
  masalahKejadian: string;
  tindakLanjutSolusi: string;
  keteranganStatus: 'Selesai' | 'Dalam Pemantauan' | 'Perlu Koordinasi Ortu' | string;
}

// Alias for backwards compatibility
export type HomeroomCounseling = HomeroomGuidance;

export type DocumentCategory = 
  | 'adm-merdeka' 
  | 'deep-learning' 
  | 'kbc-ppra' 
  | 'asesmen';

export interface GeneratedDocument {
  id: string;
  docCode: string; // e.g. "ADM-CP", "ADM-TP", "MODUL-DL", "KBC-MODUL", "KBC-LKPD"
  title: string;
  category: DocumentCategory;
  mapel: string;
  fase: string;
  kelas: string;
  semester: 'Ganjil' | 'Genap' | '1 Tahun' | string;
  alokasiWaktu?: string;
  modelPembelajaran?: string;
  pancaCintaFocus?: string;
  isLandscape?: boolean;
  contentHtml: string;
  rawJson?: any;
  teacherName?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
