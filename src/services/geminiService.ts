import { SchoolConfig, User } from '../types';
import { generateKopHtml, generateSignatureTableHtml } from './docExportHelper';

export interface GenerationParams {
  docType: string;
  docTitle: string;
  mapel: string;
  fase: string;
  kelas: string;
  semester: 'Ganjil' | 'Genap' | '1 Tahun';
  alokasiWaktu?: string;
  elemenCp?: string;
  materiPokok?: string;
  modelPembelajaran?: string;
  pancaCintaFocus?: string;
  ppraFocus?: string;
  tujuanSpesifik?: string;
  customNotes?: string;
}

export async function generateDocumentWithAI(
  params: GenerationParams,
  config: SchoolConfig,
  currentUser: User
): Promise<{ title: string; contentHtml: string; isLandscape: boolean; docCode: string }> {
  const isLandscape = [
    'ADM-ATP',
    'ADM-PROSEM',
    'ADM-KKTP',
    'ATP-KBC',
    'PROSEM-KBC',
    'KKTP-KBC',
    'RUBRIK-FORMATIF-KBC',
    'RUBRIK-SUMATIF-KBC'
  ].includes(params.docType);

  const prompt = buildPromptForDocType(params, config, currentUser);

  let rawAiResponse = '';
  let usedFallback = false;

  try {
    const res = await fetch('/api/gemini/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        systemInstruction: `Anda adalah pakar penyusun Perangkat Ajar Kurikulum Merdeka dan Kurikulum Berbasis Cinta (KBC) dengan integrasi Nilai PPRA (Profil Pelajar Rahmatan Lil Alamin) terdepan di Indonesia. 
        Keluarkan HANYA konten HTML dokumen akademik (dalam tag <div> atau tabel <table class="content-table"> yang rapi, elegan, berbobot ilmiah, sistematis, dan langsung dapat dicetak). 
        JANGAN buat tag <html>, <head>, atau <body>. 
        JANGAN sertakan Kop Surat atau Tanda Tangan karena Kop dan Tanda Tangan akan disematkan otomatis secara formal oleh sistem.`,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.text) {
        rawAiResponse = cleanMarkdownCodeBlocks(data.text);
      } else {
        usedFallback = true;
      }
    } else {
      usedFallback = true;
    }
  } catch (error) {
    console.warn('API error, using intelligent template engine:', error);
    usedFallback = true;
  }

  if (usedFallback || !rawAiResponse) {
    rawAiResponse = getIntelligentFallbackTemplate(params, config, currentUser);
  }

  // Wrap with formal Kop and 2-column signature table without border
  const kopHtml = generateKopHtml(config, params.docTitle, `Mata Pelajaran: ${params.mapel} | ${params.fase} (${params.kelas}) | Tahun Ajaran ${config.tahunPelajaran}`);
  const signatureHtml = generateSignatureTableHtml(config, currentUser.nama, currentUser.nip, `Guru Mata Pelajaran ${params.mapel}`);

  const fullContentHtml = `
  <div class="academic-document-page ${isLandscape ? 'orientation-landscape' : 'orientation-portrait'}">
    ${kopHtml}
    <div class="document-body-content" style="font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.5; color: #111;">
      ${rawAiResponse}
    </div>
    ${signatureHtml}
  </div>
  `;

  return {
    title: params.docTitle,
    contentHtml: fullContentHtml,
    isLandscape,
    docCode: params.docType,
  };
}

export interface CurriculumGenerateArgs {
  docType: string;
  mapel: string;
  kelas: string;
  fase: string;
  semester: string;
  materiPokok?: string;
  alokasiWaktu?: string;
  schoolConfig: SchoolConfig;
  teacher: User;
  isLandscape?: boolean;
}

export async function generateCurriculumDocument(args: CurriculumGenerateArgs) {
  let category: 'adm-merdeka' | 'deep-learning' | 'kbc-ppra' | 'asesmen' = 'adm-merdeka';
  if (args.docType.startsWith('KBC')) category = 'kbc-ppra';
  else if (args.docType.includes('DEEP')) category = 'deep-learning';
  else if (args.docType.includes('SUMATIF')) category = 'asesmen';

  const docTitleMap: Record<string, string> = {
    'ADM-CP': 'CAPAIAN PEMBELAJARAN (CP)',
    'ADM-TP': 'TUJUAN PEMBELAJARAN (TP)',
    'ADM-ATP': 'ALUR TUJUAN PEMBELAJARAN (ATP)',
    'ADM-PROTA': 'PROGRAM TAHUNAN (PROTA)',
    'ADM-PROSEM': 'PROGRAM SEMESTER (PROSEM)',
    'ADM-KKTP': 'KRITERIA KETERCAPAIAN TUJUAN PEMBELAJARAN (KKTP)',
    'MODUL-DEEP-LEARNING': 'MODUL AJAR DEEP LEARNING (MINDFUL, MEANINGFUL, & JOYFUL)',
    'ASESMEN-SUMATIF-AI': 'KISI-KISI, INSTRUMEN SOAL, & RUBRIK ASESMEN SUMATIF',
    'KBC-ACP': 'ANALISIS CAPAIAN PEMBELAJARAN BERBASIS CINTA (ACP KBC)',
    'KBC-TP': 'TUJUAN PEMBELAJARAN BERBASIS CINTA & KARAKTER (TP KBC)',
    'KBC-ATP': 'ALUR TUJUAN PEMBELAJARAN TERPADU KBC (ATP KBC)',
    'KBC-PROTA': 'PROGRAM TAHUNAN KURIKULUM BERBASIS CINTA (PROTA KBC)',
    'KBC-PROSEM': 'PROGRAM SEMESTER KURIKULUM BERBASIS CINTA (PROSEM KBC)',
    'KBC-KKTP': 'KKTP & RUBRIK PROFIL CINTA KARAKTER (KKTP KBC)',
    'KBC-MODUL': 'MODUL AJAR TERPADU DEEP LEARNING KBC (MODUL KBC)',
    'KBC-LKPD': 'LEMBAR KERJA PESERTA DIDIK PENUH CINTA (LKPD KBC)',
    'KBC-FORMATIF': 'RUBRIK ASESMEN FORMATIF ADAB & KARAKTER CINTA',
    'KBC-SUMATIF': 'RUBRIK ASESMEN SUMATIF & PORTOFOLIO CINTA KBC',
  };

  const title = docTitleMap[args.docType] || `DOKUMEN ${args.docType}`;

  const generated = await generateDocumentWithAI(
    {
      docType: args.docType,
      docTitle: title,
      mapel: args.mapel,
      fase: args.fase,
      kelas: args.kelas,
      semester: (args.semester === 'Genap' ? 'Genap' : args.semester === 'Ganjil' ? 'Ganjil' : '1 Tahun') as any,
      alokasiWaktu: args.alokasiWaktu,
      materiPokok: args.materiPokok,
      pancaCintaFocus: 'Internalisasi 7 Nilai Inti Cinta KBC',
    },
    args.schoolConfig,
    args.teacher
  );

  return {
    id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    docCode: args.docType,
    title: `${title} - ${args.mapel} ${args.kelas}`,
    category,
    mapel: args.mapel,
    fase: args.fase,
    kelas: args.kelas,
    semester: args.semester,
    alokasiWaktu: args.alokasiWaktu,
    isLandscape: args.isLandscape ?? generated.isLandscape,
    contentHtml: generated.contentHtml,
    teacherName: args.teacher.nama,
    createdBy: args.teacher.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function cleanMarkdownCodeBlocks(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```html')) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
}

function buildPromptForDocType(params: GenerationParams, config: SchoolConfig, user: User): string {
  return `
Buatkan dokumen administrasi akademik resmi lengkap:
- Jenis Dokumen: ${params.docType} (${params.docTitle})
- Satuan Pendidikan: ${config.namaSekolah}
- Mata Pelajaran: ${params.mapel}
- Fase & Kelas: ${params.fase} / ${params.kelas}
- Semester: ${params.semester} (Tahun Ajaran ${config.tahunPelajaran})
- Alokasi Waktu: ${params.alokasiWaktu || '32 - 36 JP per Semester'}
- Elemen CP: ${params.elemenCp || 'Elemen Pemahaman & Keterampilan Proses Terpadu'}
- Materi Pokok: ${params.materiPokok || 'Topik Utama Semester Aktif'}
- Model Pembelajaran: ${params.modelPembelajaran || 'Problem-Based Learning / Project-Based Learning'}
- Integrasi Panca Cinta KBC: ${params.pancaCintaFocus || 'Panca Cinta (Cinta Allah & Rasul, Diri & Sesama, Ilmu, Bangsa, Alam)'}
- Nilai PPRA: ${params.ppraFocus || 'Keteladanan, Berkeadaban, Toleransi, Dinamis & Inovatif'}
- Catatan Tambahan Guru: ${params.customNotes || 'Buat sangat komprehensif, akademis, tabel lengkap, dan memenuhi regulasi Kemendikbudristek & Kemenag.'}

Pastikan menyertakan tabel dengan kelas CSS: <table class="content-table" style="width: 100%; border-collapse: collapse; margin: 14px 0; font-size: 10pt;"> dengan border 1px solid #1f2937 dan header berwarna #f3f4f6.
`;
}

function getIntelligentFallbackTemplate(params: GenerationParams, config: SchoolConfig, user: User): string {
  const mapel = params.mapel || 'Matematika';
  const kelas = params.kelas || 'Kelas VII';
  const fase = params.fase || 'Fase D';
  const semester = params.semester || 'Ganjil';
  const materi = params.materiPokok || 'Konsep Dasar, Penerapan Kontekstual, dan Penalaran Kritis';

  switch (params.docType) {
    case 'ADM-CP':
    case 'ACP-KBC':
      return `
      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 12pt; font-weight: bold; margin-bottom: 8px;">I. IDENTITAS MATA PELAJARAN</h3>
        <table class="content-table" style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
          <tr><td style="width: 25%; font-weight: bold;">Mata Pelajaran</td><td>${mapel}</td><td style="width: 20%; font-weight: bold;">Fase / Kelas</td><td>${fase} / ${kelas}</td></tr>
          <tr><td style="font-weight: bold;">Satuan Pendidikan</td><td>${config.namaSekolah}</td><td style="font-weight: bold;">Tahun Ajaran</td><td>${config.tahunPelajaran}</td></tr>
          <tr><td style="font-weight: bold;">Alokasi Waktu</td><td colspan="3">3 Jam Pelajaran / Minggu (Total 54 JP per Semester)</td></tr>
        </table>

        <h3 style="font-size: 12pt; font-weight: bold; margin-top: 18px; margin-bottom: 8px;">II. RASIONAL DAN TUJUAN MATA PELAJARAN</h3>
        <p style="text-align: justify; margin-bottom: 8px;">
          Mata pelajaran ${mapel} pada ${fase} membekali peserta didik dengan kemampuan berpikir logis, analitis, sistematis, kritis, kreatif, serta kemampuan bekerja sama. Pembelajaran dirancang untuk menumbuhkan rasa ingin tahu ilmiah (Cinta Ilmu Pengetahuan), kecintaan kepada Allah SWT dan Rasul-Nya melalui keteraturan semesta, serta kepedulian terhadap kemaslahatan sesama manusia dan lingkungan hidup.
        </p>

        <h3 style="font-size: 12pt; font-weight: bold; margin-top: 18px; margin-bottom: 8px;">III. KARAKTERISTIK DAN ELEMEN CAPAIAN PEMBELAJARAN</h3>
        <table class="content-table" style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
          <thead>
            <tr style="background: #f3f4f6;">
              <th style="border: 1px solid #000; padding: 6px; width: 25%;">Elemen</th>
              <th style="border: 1px solid #000; padding: 6px;">Capaian Pembelajaran (CP) Elemen Fase</th>
              <th style="border: 1px solid #000; padding: 6px; width: 20%;">Penjabaran KKO Bloom</th>
              <th style="border: 1px solid #000; padding: 6px; width: 25%;">Integrasi 8 Dimensi & Panca Cinta</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid #000; padding: 6px; font-weight: bold;">Pemahaman Konsep & Penalaran</td>
              <td style="border: 1px solid #000; padding: 6px;">Peserta didik mampu memahami, mengidentifikasi, membandingkan, serta menganalisis relasi logika dan representasi matematis/ilmiah dalam memecahkan persoalan kontekstual.</td>
              <td style="border: 1px solid #000; padding: 6px;">C2 (Memahami), C3 (Menerapkan), C4 (Menganalisis)</td>
              <td style="border: 1px solid #000; padding: 6px;"><span class="highlight-badge badge-dimensi">Bernalar Kritis</span><br><span class="highlight-badge badge-love">Cinta Ilmu Pengetahuan</span></td>
            </tr>
            <tr>
              <td style="border: 1px solid #000; padding: 6px; font-weight: bold;">Keterampilan Proses & Kolaborasi</td>
              <td style="border: 1px solid #000; padding: 6px;">Peserta didik mampu merumuskan hipotesis, melakukan penyelidikan terbimbing, mengolah data, menarik kesimpulan secara jujur, dan mengkomunikasikannya secara santun.</td>
              <td style="border: 1px solid #000; padding: 6px;">C4 (Menyelidiki), C5 (Mengevaluasi), P3 (Mempresentasikan)</td>
              <td style="border: 1px solid #000; padding: 6px;"><span class="highlight-badge badge-dimensi">Gotong Royong</span><br><span class="highlight-badge badge-love">Cinta Sesama</span><br><span class="highlight-badge badge-ppra">Musyawarah (Syura)</span></td>
            </tr>
          </tbody>
        </table>

        <h3 style="font-size: 12pt; font-weight: bold; margin-top: 18px; margin-bottom: 8px;">IV. PEMETAAN 8 DIMENSI PROFIL LULUSAN & NILAI PPRA</h3>
        <p style="text-align: justify;">
          1. <strong>Keimanan & Ketakwaan:</strong> Menyadari kebesaran Sang Pencipta melalui keteraturan kaidah ilmu (Panca Cinta: Cinta Allah & Rasul).<br>
          2. <strong>Kewargaan & Kebangsaan:</strong> Berperan aktif memajukan masyarakat Indonesia dengan menjunjung tinggi toleransi dan keadilan (PPRA: Tasamuh & I'tidal).<br>
          3. <strong>Penalaran Kritis & Kreativitas:</strong> Mampu memecahkan masalah kontekstual dengan inovasi yang maslahat (PPRA: Tathawwur wa Ibtikar).
        </p>
      </div>
      `;

    case 'ADM-TP':
    case 'TP-KBC':
      return `
      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 12pt; font-weight: bold; margin-bottom: 8px;">A. PANDUAN KODEFIKASI TUJUAN PEMBELAJARAN (TP)</h3>
        <p style="margin-bottom: 12px; font-size: 10pt; color: #374151;">
          Format Pengkodean: <strong>TP.[Fase].[Nomor Elemen].[Nomor Urut TP]</strong> (Formula ABCD: Audience, Behavior KKO Bloom C2-C5, Condition, Degree).
        </p>

        <h3 style="font-size: 12pt; font-weight: bold; margin-bottom: 8px;">B. DAFTAR RUMUSAN TUJUAN PEMBELAJARAN PER ELEMEN</h3>
        <table class="content-table" style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
          <thead>
            <tr style="background: #f3f4f6;">
              <th style="border: 1px solid #000; padding: 6px; width: 10%;">Kode TP</th>
              <th style="border: 1px solid #000; padding: 6px; width: 20%;">Elemen Capaian</th>
              <th style="border: 1px solid #000; padding: 6px;">Rumusan Tujuan Pembelajaran (ABCD & Bloom)</th>
              <th style="border: 1px solid #000; padding: 6px; width: 15%;">Aspek Kompetensi</th>
              <th style="border: 1px solid #000; padding: 6px; width: 10%;">Alokasi JP</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">TP.D.1.1</td>
              <td style="border: 1px solid #000; padding: 6px;">Pemahaman Konsep</td>
              <td style="border: 1px solid #000; padding: 6px;">Melalui eksplorasi kontekstual, peserta didik mampu <strong>mengidentifikasi dan membedakan</strong> sifat-sifat operasi dasar secara tepat dan mandiri.</td>
              <td style="border: 1px solid #000; padding: 6px;">Kognitif (C2) & Sikap Teliti</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">6 JP</td>
            </tr>
            <tr>
              <td style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">TP.D.1.2</td>
              <td style="border: 1px solid #000; padding: 6px;">Pemahaman Konsep</td>
              <td style="border: 1px solid #000; padding: 6px;">Melalui diskusi interaktif berbasis Problem-Based Learning, peserta didik dapat <strong>mengaplikasikan</strong> formulasi rumus pada persoalan harian dengan akurasi minimal 80%.</td>
              <td style="border: 1px solid #000; padding: 6px;">Kognitif (C3) & Bernalar Kritis</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">6 JP</td>
            </tr>
            <tr>
              <td style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">TP.D.2.1</td>
              <td style="border: 1px solid #000; padding: 6px;">Keterampilan Proses</td>
              <td style="border: 1px solid #000; padding: 6px;">Melalui kerja kelompok terpadu, peserta didik mampu <strong>menganalisis dan memecahkan</strong> studi kasus lingkungan dengan penuh tanggung jawab dan semangat cinta alam.</td>
              <td style="border: 1px solid #000; padding: 6px;">Kognitif (C4) & Kolaboratif</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">8 JP</td>
            </tr>
            <tr>
              <td style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">TP.D.2.2</td>
              <td style="border: 1px solid #000; padding: 6px;">Keterampilan Proses</td>
              <td style="border: 1px solid #000; padding: 6px;">Peserta didik mampu <strong>mempresentasikan</strong> karya proyek mini dan merefleksikan hikmah pembelajaran secara santun dan beradab.</td>
              <td style="border: 1px solid #000; padding: 6px;">Psikomotorik (P3) & Berkeadaban</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">6 JP</td>
            </tr>
          </tbody>
          <tfoot>
            <tr style="background: #f9fafb; font-weight: bold;">
              <td colspan="4" style="border: 1px solid #000; padding: 6px; text-align: right;">TOTAL ALOKASI WAKTU SEMESTER GANJIL</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center;">26 JP</td>
            </tr>
          </tfoot>
        </table>
      </div>
      `;

    case 'ADM-ATP':
    case 'ATP-KBC':
      return `
      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 12pt; font-weight: bold; margin-bottom: 8px;">A. DIAGRAM ALUR TUJUAN PEMBELAJARAN (VISUAL FLOWCHART)</h3>
        <div style="padding: 12px; background: #f8fafc; border: 1px dashed #64748b; border-radius: 6px; text-align: center; margin-bottom: 18px;">
          <span style="display: inline-block; padding: 6px 14px; background: #dbeafe; color: #1e40af; font-weight: bold; border-radius: 20px; border: 1px solid #93c5fd;">TP.D.1.1 (Orientasi Dasar)</span>
          <span style="font-size: 14pt; font-weight: bold; color: #475569; margin: 0 10px;">➔</span>
          <span style="display: inline-block; padding: 6px 14px; background: #e0e7ff; color: #3730a3; font-weight: bold; border-radius: 20px; border: 1px solid #a5b4fc;">TP.D.1.2 (Penerapan Kontekstual)</span>
          <span style="font-size: 14pt; font-weight: bold; color: #475569; margin: 0 10px;">➔</span>
          <span style="display: inline-block; padding: 6px 14px; background: #fce7f3; color: #9d174d; font-weight: bold; border-radius: 20px; border: 1px solid #fbcfe8;">TP.D.2.1 (Analisis & Investigasi)</span>
          <span style="font-size: 14pt; font-weight: bold; color: #475569; margin: 0 10px;">➔</span>
          <span style="display: inline-block; padding: 6px 14px; background: #dcfce7; color: #166534; font-weight: bold; border-radius: 20px; border: 1px solid #86efac;">TP.D.2.2 (Proyek & Refleksi KBC)</span>
        </div>

        <h3 style="font-size: 12pt; font-weight: bold; margin-bottom: 8px;">B. MATRIKS ALUR TUJUAN PEMBELAJARAN (8 KOLOM STANDARD)</h3>
        <table class="content-table" style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
          <thead>
            <tr style="background: #f3f4f6;">
              <th style="border: 1px solid #000; padding: 6px; width: 8%;">Kode</th>
              <th style="border: 1px solid #000; padding: 6px; width: 14%;">Elemen</th>
              <th style="border: 1px solid #000; padding: 6px;">Tujuan Pembelajaran</th>
              <th style="border: 1px solid #000; padding: 6px; width: 18%;">Materi Pokok & Sub-Materi</th>
              <th style="border: 1px solid #000; padding: 6px; width: 8%;">Level Bloom</th>
              <th style="border: 1px solid #000; padding: 6px; width: 15%;">Profil Lulusan & PPRA</th>
              <th style="border: 1px solid #000; padding: 6px; width: 6%;">JP</th>
              <th style="border: 1px solid #000; padding: 6px; width: 8%;">Semester</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">TP.D.1.1</td>
              <td style="border: 1px solid #000; padding: 6px;">Pemahaman</td>
              <td style="border: 1px solid #000; padding: 6px;">Mengidentifikasi dan membedakan sifat operasi dasar secara tepat.</td>
              <td style="border: 1px solid #000; padding: 6px;">Struktur & Konsep Operasi Bilangan</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center;">C2</td>
              <td style="border: 1px solid #000; padding: 6px;">Bernalar Kritis, Cinta Ilmu</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">6</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center;">1 (Ganjil)</td>
            </tr>
            <tr>
              <td style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">TP.D.1.2</td>
              <td style="border: 1px solid #000; padding: 6px;">Pemahaman</td>
              <td style="border: 1px solid #000; padding: 6px;">Mengaplikasikan konsep ke dalam persoalan kontekstual harian.</td>
              <td style="border: 1px solid #000; padding: 6px;">Model Matematika & Aljabar Kontekstual</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center;">C3</td>
              <td style="border: 1px solid #000; padding: 6px;">Kreatif, Mandiri</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">6</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center;">1 (Ganjil)</td>
            </tr>
            <tr>
              <td style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">TP.D.2.1</td>
              <td style="border: 1px solid #000; padding: 6px;">Keterampilan</td>
              <td style="border: 1px solid #000; padding: 6px;">Menganalisis fenomena kuantitatif dalam isu kelestarian alam.</td>
              <td style="border: 1px solid #000; padding: 6px;">Pengolahan Data & Estimasi Lingkungan</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center;">C4</td>
              <td style="border: 1px solid #000; padding: 6px;">Gotong Royong, Cinta Alam</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">8</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center;">1 (Ganjil)</td>
            </tr>
            <tr>
              <td style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">TP.D.2.2</td>
              <td style="border: 1px solid #000; padding: 6px;">Keterampilan</td>
              <td style="border: 1px solid #000; padding: 6px;">Mempresentasikan hasil proyek karya dan refleksi etika cinta sesama.</td>
              <td style="border: 1px solid #000; padding: 6px;">Penyusunan Laporan & Komunikasi Hasil</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center;">C5 / P3</td>
              <td style="border: 1px solid #000; padding: 6px;">Berkeadaban (Ta'addub), Syura</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">6</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center;">1 (Ganjil)</td>
            </tr>
          </tbody>
          <tfoot>
            <tr style="background: #f9fafb; font-weight: bold;">
              <td colspan="6" style="border: 1px solid #000; padding: 6px; text-align: right;">TOTAL ALOKASI JP EFEKTIF</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center;">26</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center;">JP</td>
            </tr>
          </tfoot>
        </table>
      </div>
      `;

    case 'ADM-PROTA':
    case 'PROTA-KBC':
      return `
      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 12pt; font-weight: bold; margin-bottom: 8px;">I. DISTRIBUSI ALOKASI WAKTU MINGGU EFEKTIF TAHUNAN</h3>
        <table class="content-table" style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
          <thead>
            <tr style="background: #f3f4f6;">
              <th style="border: 1px solid #000; padding: 6px;">No</th>
              <th style="border: 1px solid #000; padding: 6px;">Semester</th>
              <th style="border: 1px solid #000; padding: 6px;">Jumlah Minggu Kalender</th>
              <th style="border: 1px solid #000; padding: 6px;">Minggu Tidak Efektif</th>
              <th style="border: 1px solid #000; padding: 6px;">Minggu Efektif</th>
              <th style="border: 1px solid #000; padding: 6px;">JP / Minggu</th>
              <th style="border: 1px solid #000; padding: 6px;">Total JP Efektif</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid #000; padding: 6px; text-align: center;">1</td>
              <td style="border: 1px solid #000; padding: 6px;">Semester 1 (Ganjil)</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center;">26</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center;">8</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">18</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center;">3</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">54 JP</td>
            </tr>
            <tr>
              <td style="border: 1px solid #000; padding: 6px; text-align: center;">2</td>
              <td style="border: 1px solid #000; padding: 6px;">Semester 2 (Genap)</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center;">26</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center;">9</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">17</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center;">3</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">51 JP</td>
            </tr>
          </tbody>
          <tfoot>
            <tr style="background: #f9fafb; font-weight: bold;">
              <td colspan="4" style="border: 1px solid #000; padding: 6px; text-align: right;">TOTAL WAKTU TAHUNAN</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center;">35 Minggu</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center;">3 JP</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center;">105 JP</td>
            </tr>
          </tfoot>
        </table>

        <h3 style="font-size: 12pt; font-weight: bold; margin-top: 18px; margin-bottom: 8px;">II. MATRIKS RENCANA PROGRAM TAHUNAN (PROTA)</h3>
        <table class="content-table" style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
          <thead>
            <tr style="background: #f3f4f6;">
              <th style="border: 1px solid #000; padding: 6px; width: 8%;">Smt</th>
              <th style="border: 1px solid #000; padding: 6px; width: 12%;">No / Kode TP</th>
              <th style="border: 1px solid #000; padding: 6px;">Tujuan Pembelajaran & Ruang Lingkup Materi</th>
              <th style="border: 1px solid #000; padding: 6px; width: 15%;">Alokasi Waktu</th>
              <th style="border: 1px solid #000; padding: 6px; width: 20%;">Keterangan / Fokus KBC</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td rowspan="5" style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold; vertical-align: middle;">GANJIL</td>
              <td style="border: 1px solid #000; padding: 6px; font-weight: bold;">TP.D.1.1</td>
              <td style="border: 1px solid #000; padding: 6px;">Memahami dan menganalisis representasi bilangan & pola teratur.</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center;">12 JP</td>
              <td style="border: 1px solid #000; padding: 6px;">Cinta Allah & Keteraturan Alam</td>
            </tr>
            <tr>
              <td style="border: 1px solid #000; padding: 6px; font-weight: bold;">TP.D.1.2</td>
              <td style="border: 1px solid #000; padding: 6px;">Menerapkan operasi logika aljabar dan pemecahan masalah kontekstual.</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center;">15 JP</td>
              <td style="border: 1px solid #000; padding: 6px;">Cinta Ilmu & Penalaran Kritis</td>
            </tr>
            <tr>
              <td style="border: 1px solid #000; padding: 6px; font-weight: bold;">TP.D.2.1</td>
              <td style="border: 1px solid #000; padding: 6px;">Menganalisis perbandingan nilai dan proporsi sosial ekonomi masyarakat.</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center;">15 JP</td>
              <td style="border: 1px solid #000; padding: 6px;">Cinta Sesama & Keadilan (Adil)</td>
            </tr>
            <tr style="background: #fffbeb;">
              <td colspan="2" style="border: 1px solid #000; padding: 6px; font-weight: bold; text-align: right;">Asesmen Sumatif Akhir Semester (SAS)</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">6 JP</td>
              <td style="border: 1px solid #000; padding: 6px;">Evaluasi Capaian Terpadu</td>
            </tr>
            <tr style="background: #f1f5f9;">
              <td colspan="2" style="border: 1px solid #000; padding: 6px; font-weight: bold; text-align: right; color: #475569;">Jam Cadangan / Pengayaan & Remedial</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold; color: #475569;">6 JP</td>
              <td style="border: 1px solid #000; padding: 6px;">Klinik Belajar Cinta Kasih</td>
            </tr>
          </tbody>
          <tfoot>
            <tr style="background: #f3f4f6; font-weight: bold;">
              <td colspan="3" style="border: 1px solid #000; padding: 6px; text-align: right;">JUMLAH ALOKASI JP SEMESTER GANJIL</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center;">54 JP</td>
              <td style="border: 1px solid #000; padding: 6px;">18 Minggu x 3 JP</td>
            </tr>
          </tfoot>
        </table>
      </div>
      `;

    case 'ADM-PROSEM':
    case 'PROSEM-KBC':
      return `
      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 12pt; font-weight: bold; margin-bottom: 8px;">MATRIKS PROGRAM SEMESTER (${semester.toUpperCase()}) - DISTRIBUSI JP MINGGUAN</h3>
        <p style="font-size: 9pt; margin-bottom: 8px;">
          <strong>Legenda Warna Matriks:</strong>
          <span style="display: inline-block; width: 14px; height: 14px; background: #3b82f6; vertical-align: middle; margin-left: 8px; margin-right: 4px; border: 1px solid #1d4ed8;"></span> Biru = JP Pembelajaran
          <span style="display: inline-block; width: 14px; height: 14px; background: #ef4444; vertical-align: middle; margin-left: 8px; margin-right: 4px; border: 1px solid #b91c1c;"></span> Merah = Libur Semester/Nasional
          <span style="display: inline-block; width: 14px; height: 14px; background: #eab308; vertical-align: middle; margin-left: 8px; margin-right: 4px; border: 1px solid #a16207;"></span> Kuning = STS / PTS
          <span style="display: inline-block; width: 14px; height: 14px; background: #22c55e; vertical-align: middle; margin-left: 8px; margin-right: 4px; border: 1px solid #15803d;"></span> Hijau = SAS / PAS
          <span style="display: inline-block; width: 14px; height: 14px; background: #94a3b8; vertical-align: middle; margin-left: 8px; margin-right: 4px; border: 1px solid #475569;"></span> Abu = Cadangan / Remedial
        </p>

        <table class="content-table" style="width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 8.5pt;">
          <thead>
            <tr style="background: #e2e8f0;">
              <th rowspan="2" style="border: 1px solid #000; padding: 4px; width: 4%;">No</th>
              <th rowspan="2" style="border: 1px solid #000; padding: 4px; width: 8%;">Kode TP</th>
              <th rowspan="2" style="border: 1px solid #000; padding: 4px; width: 22%;">Tujuan Pembelajaran / Materi Pokok</th>
              <th rowspan="2" style="border: 1px solid #000; padding: 4px; width: 5%;">Jml JP</th>
              <th colspan="4" style="border: 1px solid #000; padding: 4px; text-align: center;">Juli</th>
              <th colspan="4" style="border: 1px solid #000; padding: 4px; text-align: center;">Agustus</th>
              <th colspan="4" style="border: 1px solid #000; padding: 4px; text-align: center;">September</th>
              <th colspan="4" style="border: 1px solid #000; padding: 4px; text-align: center;">Oktober</th>
              <th colspan="4" style="border: 1px solid #000; padding: 4px; text-align: center;">November</th>
              <th colspan="4" style="border: 1px solid #000; padding: 4px; text-align: center;">Desember</th>
              <th rowspan="2" style="border: 1px solid #000; padding: 4px; width: 12%;">Model Pembelajaran</th>
            </tr>
            <tr style="background: #f1f5f9;">
              <!-- Juli -->
              <th style="border: 1px solid #000; padding: 2px; width: 2%;">1</th><th style="border: 1px solid #000; padding: 2px; width: 2%;">2</th><th style="border: 1px solid #000; padding: 2px; width: 2%;">3</th><th style="border: 1px solid #000; padding: 2px; width: 2%;">4</th>
              <!-- Agust -->
              <th style="border: 1px solid #000; padding: 2px; width: 2%;">1</th><th style="border: 1px solid #000; padding: 2px; width: 2%;">2</th><th style="border: 1px solid #000; padding: 2px; width: 2%;">3</th><th style="border: 1px solid #000; padding: 2px; width: 2%;">4</th>
              <!-- Sept -->
              <th style="border: 1px solid #000; padding: 2px; width: 2%;">1</th><th style="border: 1px solid #000; padding: 2px; width: 2%;">2</th><th style="border: 1px solid #000; padding: 2px; width: 2%;">3</th><th style="border: 1px solid #000; padding: 2px; width: 2%;">4</th>
              <!-- Okt -->
              <th style="border: 1px solid #000; padding: 2px; width: 2%;">1</th><th style="border: 1px solid #000; padding: 2px; width: 2%;">2</th><th style="border: 1px solid #000; padding: 2px; width: 2%;">3</th><th style="border: 1px solid #000; padding: 2px; width: 2%;">4</th>
              <!-- Nov -->
              <th style="border: 1px solid #000; padding: 2px; width: 2%;">1</th><th style="border: 1px solid #000; padding: 2px; width: 2%;">2</th><th style="border: 1px solid #000; padding: 2px; width: 2%;">3</th><th style="border: 1px solid #000; padding: 2px; width: 2%;">4</th>
              <!-- Des -->
              <th style="border: 1px solid #000; padding: 2px; width: 2%;">1</th><th style="border: 1px solid #000; padding: 2px; width: 2%;">2</th><th style="border: 1px solid #000; padding: 2px; width: 2%;">3</th><th style="border: 1px solid #000; padding: 2px; width: 2%;">4</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid #000; padding: 4px; text-align: center;">1</td>
              <td style="border: 1px solid #000; padding: 4px; font-weight: bold;">TP.D.1.1</td>
              <td style="border: 1px solid #000; padding: 4px;">Konsep Bilangan Bulat & Representasi Garis</td>
              <td style="border: 1px solid #000; padding: 4px; text-align: center; font-weight: bold;">12 JP</td>
              <!-- Juli -->
              <td style="background: #fee2e2; border: 1px solid #000; text-align: center;">L</td>
              <td style="background: #fee2e2; border: 1px solid #000; text-align: center;">MP</td>
              <td style="background: #bfdbfe; border: 1px solid #000; text-align: center; font-weight: bold;">3</td>
              <td style="background: #bfdbfe; border: 1px solid #000; text-align: center; font-weight: bold;">3</td>
              <!-- Agust -->
              <td style="background: #bfdbfe; border: 1px solid #000; text-align: center; font-weight: bold;">3</td>
              <td style="background: #bfdbfe; border: 1px solid #000; text-align: center; font-weight: bold;">3</td>
              <td style="border: 1px solid #000;"></td><td style="border: 1px solid #000;"></td>
              <!-- Sept -->
              <td style="border: 1px solid #000;"></td><td style="border: 1px solid #000;"></td><td style="border: 1px solid #000;"></td><td style="border: 1px solid #000;"></td>
              <!-- Okt -->
              <td style="border: 1px solid #000;"></td><td style="border: 1px solid #000;"></td><td style="border: 1px solid #000;"></td><td style="border: 1px solid #000;"></td>
              <!-- Nov -->
              <td style="border: 1px solid #000;"></td><td style="border: 1px solid #000;"></td><td style="border: 1px solid #000;"></td><td style="border: 1px solid #000;"></td>
              <!-- Des -->
              <td style="border: 1px solid #000;"></td><td style="border: 1px solid #000;"></td><td style="border: 1px solid #000;"></td><td style="border: 1px solid #000;"></td>
              <td style="border: 1px solid #000; padding: 4px;">Problem-Based Learning (PBL)</td>
            </tr>
            <tr>
              <td style="border: 1px solid #000; padding: 4px; text-align: center;">2</td>
              <td style="border: 1px solid #000; padding: 4px; font-weight: bold;">TP.D.1.2</td>
              <td style="border: 1px solid #000; padding: 4px;">Operasi Aljabar & Pemecahan Masalah</td>
              <td style="border: 1px solid #000; padding: 4px; text-align: center; font-weight: bold;">15 JP</td>
              <!-- Juli -->
              <td style="border: 1px solid #000;"></td><td style="border: 1px solid #000;"></td><td style="border: 1px solid #000;"></td><td style="border: 1px solid #000;"></td>
              <!-- Agust -->
              <td style="border: 1px solid #000;"></td><td style="border: 1px solid #000;"></td>
              <td style="background: #bfdbfe; border: 1px solid #000; text-align: center; font-weight: bold;">3</td>
              <td style="background: #bfdbfe; border: 1px solid #000; text-align: center; font-weight: bold;">3</td>
              <!-- Sept -->
              <td style="background: #bfdbfe; border: 1px solid #000; text-align: center; font-weight: bold;">3</td>
              <td style="background: #bfdbfe; border: 1px solid #000; text-align: center; font-weight: bold;">3</td>
              <td style="background: #fef08a; border: 1px solid #000; text-align: center; font-weight: bold;">STS</td>
              <td style="background: #bfdbfe; border: 1px solid #000; text-align: center; font-weight: bold;">3</td>
              <!-- Okt -->
              <td style="border: 1px solid #000;"></td><td style="border: 1px solid #000;"></td><td style="border: 1px solid #000;"></td><td style="border: 1px solid #000;"></td>
              <!-- Nov -->
              <td style="border: 1px solid #000;"></td><td style="border: 1px solid #000;"></td><td style="border: 1px solid #000;"></td><td style="border: 1px solid #000;"></td>
              <!-- Des -->
              <td style="border: 1px solid #000;"></td><td style="border: 1px solid #000;"></td><td style="border: 1px solid #000;"></td><td style="border: 1px solid #000;"></td>
              <td style="border: 1px solid #000; padding: 4px;">Discovery & Inquiry Learning</td>
            </tr>
            <tr>
              <td style="border: 1px solid #000; padding: 4px; text-align: center;">3</td>
              <td style="border: 1px solid #000; padding: 4px; font-weight: bold;">TP.D.2.1</td>
              <td style="border: 1px solid #000; padding: 4px;">Perbandingan Senilai, Berbalik Nilai & Sosio-KBC</td>
              <td style="border: 1px solid #000; padding: 4px; text-align: center; font-weight: bold;">15 JP</td>
              <!-- Juli -->
              <td style="border: 1px solid #000;"></td><td style="border: 1px solid #000;"></td><td style="border: 1px solid #000;"></td><td style="border: 1px solid #000;"></td>
              <!-- Agust -->
              <td style="border: 1px solid #000;"></td><td style="border: 1px solid #000;"></td><td style="border: 1px solid #000;"></td><td style="border: 1px solid #000;"></td>
              <!-- Sept -->
              <td style="border: 1px solid #000;"></td><td style="border: 1px solid #000;"></td><td style="border: 1px solid #000;"></td><td style="border: 1px solid #000;"></td>
              <!-- Okt -->
              <td style="background: #bfdbfe; border: 1px solid #000; text-align: center; font-weight: bold;">3</td>
              <td style="background: #bfdbfe; border: 1px solid #000; text-align: center; font-weight: bold;">3</td>
              <td style="background: #bfdbfe; border: 1px solid #000; text-align: center; font-weight: bold;">3</td>
              <td style="background: #bfdbfe; border: 1px solid #000; text-align: center; font-weight: bold;">3</td>
              <!-- Nov -->
              <td style="background: #bfdbfe; border: 1px solid #000; text-align: center; font-weight: bold;">3</td>
              <td style="border: 1px solid #000;"></td><td style="border: 1px solid #000;"></td><td style="border: 1px solid #000;"></td>
              <!-- Des -->
              <td style="border: 1px solid #000;"></td><td style="border: 1px solid #000;"></td><td style="border: 1px solid #000;"></td><td style="border: 1px solid #000;"></td>
              <td style="border: 1px solid #000; padding: 4px;">Project-Based Learning (PjBL)</td>
            </tr>
            <tr style="background: #f8fafc;">
              <td colspan="3" style="border: 1px solid #000; padding: 4px; font-weight: bold; text-align: right;">Asesmen Sumatif Akhir Semester (SAS) & Remedial</td>
              <td style="border: 1px solid #000; padding: 4px; text-align: center; font-weight: bold;">12 JP</td>
              <!-- Juli to Nov -->
              <td colspan="17" style="border: 1px solid #000; text-align: center; color: #64748b;">-</td>
              <!-- Nov 2,3,4 & Des -->
              <td style="background: #bbf7d0; border: 1px solid #000; text-align: center; font-weight: bold;">SAS</td>
              <td style="background: #bbf7d0; border: 1px solid #000; text-align: center; font-weight: bold;">SAS</td>
              <td style="background: #cbd5e1; border: 1px solid #000; text-align: center;">Rem</td>
              <td style="background: #cbd5e1; border: 1px solid #000; text-align: center;">Rem</td>
              <td style="background: #fee2e2; border: 1px solid #000; text-align: center;">LS1</td>
              <td style="background: #fee2e2; border: 1px solid #000; text-align: center;">LS1</td>
              <td style="border: 1px solid #000; padding: 4px;">Asesmen Autentik & Portofolio</td>
            </tr>
          </tbody>
          <tfoot>
            <tr style="background: #e2e8f0; font-weight: bold;">
              <td colspan="3" style="border: 1px solid #000; padding: 4px; text-align: right;">TOTAL DISTRIBUSI JP SEMESTER GANJIL</td>
              <td style="border: 1px solid #000; padding: 4px; text-align: center;">54 JP</td>
              <td colspan="24" style="border: 1px solid #000; padding: 4px; text-align: center;">18 Minggu Efektif x 3 JP/Minggu</td>
              <td style="border: 1px solid #000; padding: 4px; text-align: center;">Terpenuhi 100%</td>
            </tr>
          </tfoot>
        </table>
      </div>
      `;

    case 'ADM-KKTP':
    case 'KKTP-KBC':
      return `
      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 12pt; font-weight: bold; margin-bottom: 4px;">KRITERIA KETERCAPAIAN TUJUAN PEMBELAJARAN (KKTP)</h3>
        <p style="font-size: 9.5pt; color: #374151; margin-bottom: 12px;">
          <em>Dasar Hukum: Permendikbudristek No. 21 Tahun 2022 tentang Standar Penilaian Pendidikan & Pendekatan Rubrik Deskripsi 4 Level Kurikulum Merdeka.</em>
        </p>

        <table class="content-table" style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
          <thead>
            <tr style="background: #f3f4f6;">
              <th rowspan="2" style="border: 1px solid #000; padding: 6px; width: 8%;">Kode TP</th>
              <th rowspan="2" style="border: 1px solid #000; padding: 6px; width: 18%;">Tujuan Pembelajaran</th>
              <th rowspan="2" style="border: 1px solid #000; padding: 6px; width: 18%;">Indikator Ketercapaian (IKTP)</th>
              <th colspan="4" style="border: 1px solid #000; padding: 6px; text-align: center;">Deskripsi Level Capaian & Kriteria Tindak Lanjut</th>
              <th rowspan="2" style="border: 1px solid #000; padding: 6px; width: 10%;">Kesimpulan Interval Nilai</th>
              <th rowspan="2" style="border: 1px solid #000; padding: 6px; width: 10%;">Tindak Lanjut Pembelajaran</th>
            </tr>
            <tr style="background: #f9fafb;">
              <th style="border: 1px solid #000; padding: 4px; width: 11%; background: #fee2e2;">Mulai Berkembang (0-69%)</th>
              <th style="border: 1px solid #000; padding: 4px; width: 11%; background: #fef3c7;">Layak / Tercapai KKTP ✓ (70-79%)</th>
              <th style="border: 1px solid #000; padding: 4px; width: 11%; background: #e0e7ff;">Cakap (80-89%)</th>
              <th style="border: 1px solid #000; padding: 4px; width: 11%; background: #dcfce7;">Mahir / Teladan (90-100%)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">TP.D.1.1</td>
              <td style="border: 1px solid #000; padding: 6px;">Memahami dan menganalisis sifat operasi hitung bilangan secara mandiri.</td>
              <td style="border: 1px solid #000; padding: 6px;">
                1. Mampu mengidentifikasi sifat komutatif, asosiatif, distributif.<br>
                2. Mampu menyelesaikan perhitungan bertingkat dengan tanda negatif.
              </td>
              <td style="border: 1px solid #000; padding: 6px; background: #fff5f5;">Belum mampu membedakan aturan tanda minus dan membutuhkan bimbingan guru penuh.</td>
              <td style="border: 1px solid #000; padding: 6px; background: #fffbeb;">Mampu menyelesaikan 75% operasi dasar dengan bantuan kartu bilangan atau diagram.</td>
              <td style="border: 1px solid #000; padding: 6px; background: #f5f3ff;">Mampu menyelesaikan operasi secara tepat, cepat, dan menjelaskan langkah logisnya.</td>
              <td style="border: 1px solid #000; padding: 6px; background: #f0fdf4;">Mampu memformulasikan cara alternatif dan membimbing teman sejawat dengan sabar.</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">KKTP = 75%<br>(Interval Layak)</td>
              <td style="border: 1px solid #000; padding: 6px;">Peserta didik pada level 'Layak' melanjutkan ke TP lanjutan; level 'Mulai Berkembang' diberikan remedial pendampingan sebaya.</td>
            </tr>
            <tr>
              <td style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">TP.D.2.1</td>
              <td style="border: 1px solid #000; padding: 6px;">Menganalisis perbandingan kontekstual dan integrasi cinta lingkungan.</td>
              <td style="border: 1px solid #000; padding: 6px;">
                1. Merumuskan rasio dari data riil sampah/energi sekolah.<br>
                2. Menghitung proyeksi dampak kelestarian lingkungan.
              </td>
              <td style="border: 1px solid #000; padding: 6px; background: #fff5f5;">Kesulitan menentukan perbandingan senilai vs berbalik nilai.</td>
              <td style="border: 1px solid #000; padding: 6px; background: #fffbeb;">Mampu menghitung rasio dasar dan menyebutkan 1 aksi cinta lingkungan.</td>
              <td style="border: 1px solid #000; padding: 6px; background: #f5f3ff;">Mampu memodelkan tabel perbandingan dan merumuskan solusi reduksi jejak karbon.</td>
              <td style="border: 1px solid #000; padding: 6px; background: #f0fdf4;">Mampu membuat infografis lengkap berbasis data dan menginspirasi kampanye kelas.</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">KKTP = 75%<br>(Interval Layak)</td>
              <td style="border: 1px solid #000; padding: 6px;">Pengayaan tugas riset terpadu bagi level Cakap & Mahir; latihan kontekstual terbimbing bagi level Mulai Berkembang.</td>
            </tr>
          </tbody>
        </table>
      </div>
      `;

    case 'MODUL-DL':
    case 'MODUL-KBC':
      return `
      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 12pt; font-weight: bold; margin-bottom: 8px;">I. INFORMASI UMUM & PRINSIP DEEP LEARNING</h3>
        <table class="content-table" style="width: 100%; border-collapse: collapse; margin-bottom: 14px;">
          <tr><td style="width: 25%; font-weight: bold;">Penyusun / Guru</td><td>${user.nama}</td><td style="width: 20%; font-weight: bold;">Satuan Pendidikan</td><td>${config.namaSekolah}</td></tr>
          <tr><td style="font-weight: bold;">Mata Pelajaran</td><td>${mapel}</td><td style="font-weight: bold;">Fase / Kelas / Smt</td><td>${fase} / ${kelas} / ${semester}</td></tr>
          <tr><td style="font-weight: bold;">Alokasi Waktu</td><td>3 JP (1 x Pertemuan @ 40 Menit)</td><td style="font-weight: bold;">Tahun Pelajaran</td><td>${config.tahunPelajaran}</td></tr>
          <tr><td style="font-weight: bold;">Pilar Deep Learning</td><td colspan="3"><span class="highlight-badge badge-love">Mindful Learning</span> <span class="highlight-badge badge-dimensi">Meaningful Learning</span> <span class="highlight-badge badge-ppra">Joyful Learning</span></td></tr>
          <tr><td style="font-weight: bold;">Integrasi Nilai KBC</td><td colspan="3"><strong>Panca Cinta:</strong> Cinta Allah & Rasul, Cinta Ilmu Pengetahuan, Cinta Sesama | <strong>PPRA:</strong> Keteladanan (Qudwah), Musyawarah (Syura)</td></tr>
        </table>

        <h3 style="font-size: 12pt; font-weight: bold; margin-top: 18px; margin-bottom: 8px;">II. KOMPONEN INTI</h3>
        <p><strong>1. Tujuan Pembelajaran (TP):</strong> Peserta didik mampu menganalisis konsep ${materi} melalui penyelidikan bermakna, berkolaborasi secara santun, dan merefleksikan nilai kemanfaatan ilmu bagi kehidupan sehari-hari.</p>
        <p><strong>2. Pemahaman Bermakna (Meaningful):</strong> Ilmu pengetahuan adalah anugerah Tuhan yang teratur dan bermanfaat untuk mempermudah urusan kemanusiaan dan merawat alam sekitar.</p>
        <p><strong>3. Pertanyaan Pemantik (Joyful & Mindful):</strong> "Bagaimana keteraturan pola di alam ini membuktikan kebesaran Sang Pencipta dan bagaimana kita memanfaatkannya dengan bijak?"</p>
        <p><strong>4. Model Pembelajaran:</strong> Problem-Based Learning (PBL) terintegrasi dengan Refleksi Panca Cinta.</p>

        <h3 style="font-size: 12pt; font-weight: bold; margin-top: 18px; margin-bottom: 8px;">III. LANGKAH-LANGKAH KEGIATAN PEMBELAJARAN (SINTAK TERPADU)</h3>
        <table class="content-table" style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
          <thead>
            <tr style="background: #f3f4f6;">
              <th style="border: 1px solid #000; padding: 6px; width: 18%;">Tahapan</th>
              <th style="border: 1px solid #000; padding: 6px;">Deskripsi Kegiatan Guru & Peserta Didik (Deep Learning & KBC Tag)</th>
              <th style="border: 1px solid #000; padding: 6px; width: 12%;">Alokasi Waktu</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid #000; padding: 6px; font-weight: bold;">A. Pendahuluan<br><em>(Mindful & Spiritual)</em></td>
              <td style="border: 1px solid #000; padding: 6px;">
                1. Guru menyapa peserta didik dengan salam hangat penuh senyuman, berdoa bersama, dan melantunkan afirmasi cinta ilmu <code>(PC: Cinta Allah & Rasul)</code>.<br>
                2. Guru memandu latihan <em>Mindful Breathing</em> (Stop, Breathe, Feel) selama 2 menit untuk memfokuskan kesadaran dan ketenangan batin.<br>
                3. Apersepsi melalui video/gambar fenomena alam dan menyampaikan tujuan pembelajaran yang menggugah motivasi.
              </td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">15 Menit</td>
            </tr>
            <tr>
              <td style="border: 1px solid #000; padding: 6px; font-weight: bold;">B. Kegiatan Inti<br><em>(Meaningful & Joyful)</em></td>
              <td style="border: 1px solid #000; padding: 6px;">
                <strong>Fase 1: Orientasi Masalah Kontekstual:</strong> Siswa mengamati studi kasus tantangan riil seputar ${materi} <code>(PC: Cinta Ilmu Pengetahuan)</code>.<br>
                <strong>Fase 2: Pengorganisasian Belajar:</strong> Siswa dibagi ke dalam kelompok heterogen, saling mendengarkan dan menghargai pendapat <code>(PPRA: Tasamuh / Toleransi)</code>.<br>
                <strong>Fase 3: Penyelidikan Terbimbing:</strong> Siswa mengerjakan LKPD KBC menggunakan media interaktif dan data nyata <code>(PC: Cinta Sesama & Kolaborasi)</code>.<br>
                <strong>Fase 4: Pengembangan & Penyajian Hasil:</strong> Setiap kelompok mempresentasikan solusi mereka dengan bahasa santun dan percaya diri <code>(PPRA: Keteladanan / Qudwah)</code>.<br>
                <strong>Fase 5: Analisis & Evaluasi:</strong> Guru bersama siswa memvalidasi konsep ilmiah dan mengapresiasi setiap ide orisinal.
              </td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">90 Menit</td>
            </tr>
            <tr>
              <td style="border: 1px solid #000; padding: 6px; font-weight: bold;">C. Penutup<br><em>(Reflektif & Apresiatif)</em></td>
              <td style="border: 1px solid #000; padding: 6px;">
                1. Siswa menuliskan 1 kalimat hikmah/refleksi: "Apa kebaikan atau rasa syukur baru yang saya peroleh hari ini?" <code>(Refleksi Panca Cinta)</code>.<br>
                2. Guru memberikan apresiasi (pujian tulus) kepada seluruh kelompok dan menutup dengan doa bersama.
              </td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">15 Menit</td>
            </tr>
          </tbody>
        </table>

        <h3 style="font-size: 12pt; font-weight: bold; margin-top: 18px; margin-bottom: 8px;">IV. ASESMEN PEMBELAJARAN</h3>
        <p>1. <strong>Asesmen Formatif:</strong> Observasi keaktifan diskusi, lembar unjuk kerja LKPD, dan penilaian sikap Panca Cinta.<br>
        2. <strong>Asesmen Sumatif:</strong> Tes tertulis pilihan ganda HOTS dan soal uraian analisis kasus berbobot skor 100.</p>
      </div>
      `;

    case 'LKPD-KBC':
      return `
      <div style="margin-bottom: 20px;">
        <div style="padding: 10px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; margin-bottom: 16px;">
          <h3 style="font-size: 12pt; font-weight: bold; color: #991b1b; margin: 0 0 4px 0;">💖 LEMBAR KERJA PESERTA DIDIK (LKPD) BERBASIS CINTA</h3>
          <p style="font-size: 10pt; color: #7f1d1d; margin: 0;">
            <em>"Bismillah, kerjakanlah lembar aktivitas ini dengan hati yang tenang, pikiran yang cemerlang, dan saling tolong-menolong bersama sahabatmu."</em>
          </p>
        </div>

        <table class="content-table" style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
          <tr><td style="width: 20%; font-weight: bold;">Nama Kelompok</td><td style="width: 30%;">......................................................</td><td style="width: 15%; font-weight: bold;">Kelas</td><td>${kelas}</td></tr>
          <tr><td style="font-weight: bold;">Anggota Kelompok</td><td colspan="3">1. ..................................... 2. ..................................... 3. ..................................... 4. .....................................</td></tr>
        </table>

        <h3 style="font-size: 11pt; font-weight: bold; margin-top: 16px;">🎯 PETUNJUK PENYELIDIKAN</h3>
        <ol style="margin-left: 20px; line-height: 1.6;">
          <li>Bacalah skenario kasus di bawah ini dengan seksama.</li>
          <li>Diskusikan bersama rekan sekelompokmu dengan santun dan saling menghargai.</li>
          <li>Tuliskan langkah pemecahan masalah pada tempat jawaban yang disediakan.</li>
        </ol>

        <div style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 12px; border-radius: 6px; margin: 16px 0;">
          <h4 style="font-size: 11pt; font-weight: bold; margin-top: 0; color: #1e293b;">📜 SKENARIO KASUS KONTEKSTUAL:</h4>
          <p style="text-align: justify; margin-bottom: 0;">
            Di sebuah lingkungan madani, sekelompok siswa ingin membangun kebun sekolah hidroponik ramah lingkungan. Mereka membutuhkan perhitungan alokasi bibit tanaman, perkiraan masa panen, serta proporsi pembagian hasil panen untuk dibagikan secara gratis kepada warga sekitar yang membutuhkan.
          </p>
        </div>

        <h4 style="font-weight: bold; margin-top: 16px;">✏️ PERTANYAAN 1 (Eksplorasi Konseptual):</h4>
        <p>Identifikasilah variabel utama dalam skenario di atas dan buatlah model matematikanya!</p>
        <div class="answer-line"></div>
        <div class="answer-line"></div>
        <div class="answer-line"></div>

        <h4 style="font-weight: bold; margin-top: 16px;">✏️ PERTANYAAN 2 (Penyelesaian Masalah & Nilai Cinta):</h4>
        <p>Berapakah proporsi hasil panen yang paling adil dan bagaimana nilai Cinta Sesama tercermin dalam keputusan kelompokmu?</p>
        <div class="answer-line"></div>
        <div class="answer-line"></div>
        <div class="answer-line"></div>

        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px; border-radius: 6px; margin-top: 24px;">
          <h4 style="font-size: 11pt; font-weight: bold; margin-top: 0; color: #166534;">🌱 REFLEKSI PERSONAL PANCA CINTA (KBC):</h4>
          <p style="font-size: 10pt; color: #14532d; margin-bottom: 6px;">
            <em>"Setelah menyelesaikan kegiatan ini, kebaikan apa yang ingin saya lakukan untuk teman, keluarga, dan lingkungan sekitar?"</em>
          </p>
          <div class="answer-line" style="border-bottom-color: #86efac;"></div>
          <div class="answer-line" style="border-bottom-color: #86efac;"></div>
        </div>
      </div>
      `;

    case 'RUBRIK-FORMATIF-KBC':
      return `
      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 12pt; font-weight: bold; margin-bottom: 8px;">RUBRIK ASESMEN FORMATIF BERBASIS PROSES & PANCA CINTA</h3>
        <p style="font-size: 9.5pt; color: #374151; margin-bottom: 12px;">
          Menilai keterlibatan aktif, nalar kritis, dan perwujudan sikap kasih sayang serta toleransi saat proses pembelajaran berlangsung.
        </p>

        <table class="content-table" style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
          <thead>
            <tr style="background: #f3f4f6;">
              <th rowspan="2" style="border: 1px solid #000; padding: 6px; width: 15%;">Aspek yang Dinilai</th>
              <th rowspan="2" style="border: 1px solid #000; padding: 6px; width: 15%;">Indikator Perilaku KBC</th>
              <th colspan="4" style="border: 1px solid #000; padding: 6px; text-align: center;">Kriteria Skala Ketercapaian (1 - 4)</th>
              <th rowspan="2" style="border: 1px solid #000; padding: 6px; width: 10%;">Bobot</th>
            </tr>
            <tr style="background: #f9fafb;">
              <th style="border: 1px solid #000; padding: 4px; width: 15%;">1 (Perlu Bimbingan)</th>
              <th style="border: 1px solid #000; padding: 4px; width: 15%;">2 (Cukup / Berkembang)</th>
              <th style="border: 1px solid #000; padding: 4px; width: 15%;">3 (Baik / Tercapai)</th>
              <th style="border: 1px solid #000; padding: 4px; width: 15%;">4 (Sangat Baik / Qudwah)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid #000; padding: 6px; font-weight: bold;">Cinta Ilmu & Nalar Kritis</td>
              <td style="border: 1px solid #000; padding: 6px;">Antusiasme mengajukan pertanyaan berbobot dan ketelitian mengolah informasi.</td>
              <td style="border: 1px solid #000; padding: 6px;">Pasif, menunggu instruksi penuh dari guru.</td>
              <td style="border: 1px solid #000; padding: 6px;">Mengajukan pertanyaan dasar ketika diminta.</td>
              <td style="border: 1px solid #000; padding: 6px;">Aktif mengeksplorasi konsep dan berargumen logis.</td>
              <td style="border: 1px solid #000; padding: 6px;">Mampu menghubungkan teori dengan hikmah aplikatif secara mandiri.</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">30%</td>
            </tr>
            <tr>
              <td style="border: 1px solid #000; padding: 6px; font-weight: bold;">Cinta Sesama & Kolaborasi</td>
              <td style="border: 1px solid #000; padding: 6px;">Kesediaan berbagi tugas, mendengarkan rekan, dan tidak memaksakan kehendak.</td>
              <td style="border: 1px solid #000; padding: 6px;">Cenderung dominan atau menarik diri dari tim.</td>
              <td style="border: 1px solid #000; padding: 6px;">Bekerja sama jika diingatkan oleh ketua kelompok.</td>
              <td style="border: 1px solid #000; padding: 6px;">Kooperatif, menghargai pendapat rekan setim.</td>
              <td style="border: 1px solid #000; padding: 6px;">Menjadi penengah yang bijak dan mengayomi anggota kelompoknya.</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">35%</td>
            </tr>
            <tr>
              <td style="border: 1px solid #000; padding: 6px; font-weight: bold;">Berkeadaban (Ta'addub) & PPRA</td>
              <td style="border: 1px solid #000; padding: 6px;">Penggunaan tutur kata yang santun, tertib, dan menjaga kebersihan lingkungan belajar.</td>
              <td style="border: 1px solid #000; padding: 6px;">Kurang santun dalam berbahasa atau kurang tertib.</td>
              <td style="border: 1px solid #000; padding: 6px;">Cukup tertib selama diawasi secara langsung.</td>
              <td style="border: 1px solid #000; padding: 6px;">Santun, tertib, dan menghormati tata tertib kelas.</td>
              <td style="border: 1px solid #000; padding: 6px;">Menunjukkan akhlak mulia dan menjadi teladan bagi temannya.</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">35%</td>
            </tr>
          </tbody>
          <tfoot>
            <tr style="background: #f3f4f6; font-weight: bold;">
              <td colspan="6" style="border: 1px solid #000; padding: 6px; text-align: right;">TOTAL BOBOT ASESMEN FORMATIF PROSES</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center;">100%</td>
            </tr>
          </tfoot>
        </table>
      </div>
      `;

    case 'RUBRIK-SUMATIF-KBC':
    case 'ASESMEN-SUMATIF-AI':
      return `
      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 12pt; font-weight: bold; margin-bottom: 4px;">KISI-KISI & INSTRUMEN ASESMEN SUMATIF TERPADU</h3>
        <p style="font-size: 9.5pt; color: #374151; margin-bottom: 12px;">
          Memadukan pengujian kognitif HOTS (Higher Order Thinking Skills) dan pemaknaan karakter Panca Cinta berbobot 100%.
        </p>

        <h4 style="font-size: 11pt; font-weight: bold; margin-top: 14px;">BAGIAN 1: KISI-KISI SOAL ASESMEN SUMATIF</h4>
        <table class="content-table" style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
          <thead>
            <tr style="background: #f3f4f6;">
              <th style="border: 1px solid #000; padding: 6px; width: 6%;">No</th>
              <th style="border: 1px solid #000; padding: 6px; width: 14%;">Capaian / Elemen</th>
              <th style="border: 1px solid #000; padding: 6px; width: 20%;">Materi Pokok</th>
              <th style="border: 1px solid #000; padding: 6px;">Indikator Soal</th>
              <th style="border: 1px solid #000; padding: 6px; width: 8%;">Level Kognitif</th>
              <th style="border: 1px solid #000; padding: 6px; width: 10%;">Bentuk Soal</th>
              <th style="border: 1px solid #000; padding: 6px; width: 6%;">Skor</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid #000; padding: 6px; text-align: center;">1</td>
              <td style="border: 1px solid #000; padding: 6px;">Pemahaman</td>
              <td style="border: 1px solid #000; padding: 6px;">Operasi Bilangan</td>
              <td style="border: 1px solid #000; padding: 6px;">Disajikan permasalahan suhu zona kutub, peserta didik dapat menghitung selisih perbedaan derajat secara akurat.</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center;">C3</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center;">Pilihan Ganda</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">20</td>
            </tr>
            <tr>
              <td style="border: 1px solid #000; padding: 6px; text-align: center;">2</td>
              <td style="border: 1px solid #000; padding: 6px;">Penalaran</td>
              <td style="border: 1px solid #000; padding: 6px;">Aljabar Kontekstual</td>
              <td style="border: 1px solid #000; padding: 6px;">Disajikan narasi pembagian bantuan sosial infak makanan, peserta didik dapat menyusun persamaan linear satu variabel dan menyelesaikannya.</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center;">C4</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center;">Uraian HOTS</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">40</td>
            </tr>
            <tr>
              <td style="border: 1px solid #000; padding: 6px; text-align: center;">3</td>
              <td style="border: 1px solid #000; padding: 6px;">Refleksi KBC</td>
              <td style="border: 1px solid #000; padding: 6px;">Panca Cinta & PPRA</td>
              <td style="border: 1px solid #000; padding: 6px;">Peserta didik mampu menganalisis implikasi etika kejujuran dan cinta sesama dalam pembuatan keputusan berbasis data ilmiah.</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center;">C5</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center;">Studi Kasus</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">40</td>
            </tr>
          </tbody>
          <tfoot>
            <tr style="background: #f3f4f6; font-weight: bold;">
              <td colspan="6" style="border: 1px solid #000; padding: 6px; text-align: right;">TOTAL SKOR MAKSIMAL SUMATIF</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center;">100</td>
            </tr>
          </tfoot>
        </table>

        <h4 style="font-size: 11pt; font-weight: bold; margin-top: 16px;">BAGIAN 2: PEDOMAN PENSKORAN & LEVELING RUBRIK SUMATIF</h4>
        <table class="content-table" style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
          <thead>
            <tr style="background: #f3f4f6;">
              <th style="border: 1px solid #000; padding: 6px; width: 20%;">Rentang Nilai</th>
              <th style="border: 1px solid #000; padding: 6px; width: 15%;">Predikat</th>
              <th style="border: 1px solid #000; padding: 6px; width: 25%;">Kategori Capaian</th>
              <th style="border: 1px solid #000; padding: 6px;">Deskripsi Naratif Rapor Merdeka</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">90 - 100</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold; color: #15803d;">A (Mahir)</td>
              <td style="border: 1px solid #000; padding: 6px;">Sangat Berkembang & Qudwah</td>
              <td style="border: 1px solid #000; padding: 6px;">Menunjukkan penguasaan istimewa dalam nalar analitis serta mampu merefleksikan nilai Panca Cinta secara nyata sebagai teladan.</td>
            </tr>
            <tr>
              <td style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">80 - 89</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold; color: #1d4ed8;">B (Cakap)</td>
              <td style="border: 1px solid #000; padding: 6px;">Berkembang Sesuai Harapan</td>
              <td style="border: 1px solid #000; padding: 6px;">Menguasai sebagian besar kompetensi dengan baik dan aktif berpartisipasi dalam investigasi ilmiah.</td>
            </tr>
            <tr>
              <td style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">70 - 79</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold; color: #b45309;">C (Layak)</td>
              <td style="border: 1px solid #000; padding: 6px;">Tercapai Ambang KKTP</td>
              <td style="border: 1px solid #000; padding: 6px;">Memahami konsep mendasar dengan cukup baik, perlu peningkatan dalam soal penerapan bertingkat.</td>
            </tr>
            <tr>
              <td style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold;">&lt; 70</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold; color: #b91c1c;">D (Perlu Bimbingan)</td>
              <td style="border: 1px solid #000; padding: 6px;">Mulai Berkembang</td>
              <td style="border: 1px solid #000; padding: 6px;">Memerlukan bimbingan intensif dan program remedial pada materi dasar operasi.</td>
            </tr>
          </tbody>
        </table>
      </div>
      `;

    default:
      return `
      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 12pt; font-weight: bold; margin-bottom: 8px;">DOKUMEN ADMINISTRASI PEMBELAJARAN</h3>
        <p style="text-align: justify;">
          Dokumen kurikulum <strong>${params.docTitle}</strong> untuk mata pelajaran <strong>${mapel}</strong> (${fase} / ${kelas}) semester ${semester} telah dirumuskan secara sistematis sesuai dengan prinsip Kurikulum Merdeka dan Kurikulum Berbasis Cinta (KBC).
        </p>
        <table class="content-table" style="width: 100%; border-collapse: collapse; margin-top: 14px;">
          <tr><th style="border: 1px solid #000; padding: 6px;">Komponen Dokumen</th><th style="border: 1px solid #000; padding: 6px;">Deskripsi Implementasi</th></tr>
          <tr><td style="border: 1px solid #000; padding: 6px; font-weight: bold;">Integrasi Kurikulum</td><td style="border: 1px solid #000; padding: 6px;">Kurikulum Merdeka Mandiri Berbagi + Kurikulum Berbasis Cinta (KBC)</td></tr>
          <tr><td style="border: 1px solid #000; padding: 6px; font-weight: bold;">Fokus Nilai PPRA</td><td style="border: 1px solid #000; padding: 6px;">Berkeadaban (Ta'addub), Keteladanan (Qudwah), Toleransi (Tasamuh), Dinamis & Inovatif (Tathawwur wa Ibtikar)</td></tr>
          <tr><td style="border: 1px solid #000; padding: 6px; font-weight: bold;">Fokus Panca Cinta</td><td style="border: 1px solid #000; padding: 6px;">Cinta Allah & Rasul, Cinta Diri & Sesama, Cinta Ilmu Pengetahuan, Cinta Bangsa & Negara, Cinta Alam & Lingkungan</td></tr>
        </table>
      </div>
      `;
  }
}
