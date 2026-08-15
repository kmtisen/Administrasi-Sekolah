import { SchoolConfig, AttendanceRecord, TeacherJournal, StudentGradeRecord } from '../types';

/**
 * Builds standard academic document Kop (Header) with centered text and double border line.
 * CRITICAL RULE: NO LOGO / IMAGES IN KOP.
 */
export function generateKopHtml(config: SchoolConfig, docTitle: string, docSubTitle?: string): string {
  return `
<div class="kop-surat" style="text-align: center; font-family: 'Times New Roman', Times, serif; color: #111827; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 3px double #111827;">
  <div style="font-size: 13pt; font-weight: bold; letter-spacing: 0.5px; text-transform: uppercase;">
    ${config.namaInstansi || 'PEMERINTAH PROVINSI / DINAS PENDIDIKAN'}
  </div>
  <div style="font-size: 16pt; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; margin: 2px 0;">
    ${config.namaSekolah || 'SEKOLAH PENGGERAK KURIKULUM MERDEKA & KBC'}
  </div>
  <div style="font-size: 10pt; font-style: normal; margin-bottom: 4px; color: #374151;">
    ${config.alamat || 'Jl. Pendidikan Karakter No. 10, Kompleks Bina Bangsa'}
  </div>
  <div style="font-size: 9pt; color: #4b5563;">
    Tahun Pelajaran: ${config.tahunPelajaran} | Semester: ${config.semesterAktif}
  </div>
</div>

<div class="doc-header-title" style="text-align: center; font-family: 'Times New Roman', Times, serif; margin-bottom: 20px;">
  <h2 style="font-size: 14pt; font-weight: bold; text-decoration: underline; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">
    ${docTitle}
  </h2>
  ${docSubTitle ? `<p style="font-size: 11pt; margin-top: 4px; color: #374151;">${docSubTitle}</p>` : ''}
</div>
`;
}

export const generateStandardKopHtml = generateKopHtml;

/**
 * Builds standard 2-column signature table without border for perfectly parallel horizontal alignment in Web, Print, and Word.
 * CRITICAL RULE: 2 Kolom Sejajar, no borders.
 */
export function generateSignatureTableHtml(
  config: SchoolConfig,
  namaGuru: string,
  nipGuru: string,
  jabatanGuru: string = 'Guru Mata Pelajaran'
): string {
  const tempatTanggal = config.tempatTanggalTtd || 'Jakarta, 14 Agustus 2026';
  const namaKepsek = config.namaKepsek || 'H. Ahmad Fauzi, M.Pd.';
  const nipKepsek = config.nipKepsek || '19750812 200003 1 002';
  const ttdGuruNama = namaGuru || 'Ustadz / Ustadzah Pengampu';
  const ttdGuruNip = nipGuru ? `NIP. ${nipGuru}` : 'NIP. -';

  return `
<table class="signature-table" style="width: 100%; border: none !important; border-collapse: collapse; margin-top: 36px; margin-bottom: 20px; font-family: 'Times New Roman', Times, serif; font-size: 11pt; page-break-inside: avoid;">
  <tbody>
    <tr style="border: none !important;">
      <td style="width: 50%; text-align: center; border: none !important; vertical-align: top; padding: 8px 12px;">
        Mengetahui,<br>
        <strong>Kepala ${config.namaSekolah || 'Sekolah'}</strong>
        <br><br><br><br><br>
        <strong><u>${namaKepsek}</u></strong><br>
        <span>NIP. ${nipKepsek}</span>
      </td>
      <td style="width: 50%; text-align: center; border: none !important; vertical-align: top; padding: 8px 12px;">
        ${tempatTanggal}<br>
        <strong>${jabatanGuru}</strong>
        <br><br><br><br><br>
        <strong><u>${ttdGuruNama}</u></strong><br>
        <span>${ttdGuruNip}</span>
      </td>
    </tr>
  </tbody>
</table>
`;
}

export const generateTwoColumnSignatureHtml = generateSignatureTableHtml;

/**
 * Generate formal HTML for Daily Attendance Book
 */
export function generateFormalAttendanceHtml(
  record: AttendanceRecord,
  config: SchoolConfig
): string {
  const kop = generateStandardKopHtml(
    config,
    'REKAPITULASI PRESENSI & JURNAL KELAS HARIAN',
    `Kelas: ${record.kelasNama} | Mata Pelajaran: ${record.mapel} | Tanggal: ${record.tanggal}`
  );
  const signature = generateSignatureTableHtml(
    config,
    record.guruNama,
    '',
    `Guru Pengampu ${record.mapel}`
  );

  const rows = record.presensi
    .map(
      (p, i) => `
    <tr>
      <td style="text-align:center; padding: 6px;">${i + 1}</td>
      <td style="padding: 6px; font-weight:bold;">${p.studentName}</td>
      <td style="text-align:center; font-weight:bold; padding: 6px;">${p.status}</td>
      <td style="padding: 6px; font-size: 9pt;">${p.catatan || '-'}</td>
    </tr>
  `
    )
    .join('');

  return `
    ${kop}
    <div style="margin-bottom: 12px; font-size: 10.5pt;">
      <strong>Materi Pokok:</strong> ${record.materiPembelajaran || '-'}<br/>
      <strong>Catatan KBM:</strong> ${record.catatanKejadian || '-'}
    </div>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 10pt;" border="1">
      <thead>
        <tr style="background-color: #f0f0f0; text-align: center;">
          <th style="width: 35px; padding: 6px;">No</th>
          <th style="padding: 6px; text-align: left;">Nama Peserta Didik</th>
          <th style="width: 80px; padding: 6px;">Status</th>
          <th style="padding: 6px; text-align: left;">Catatan Tambahan</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
    ${signature}
  `;
}

/**
 * Generate formal HTML for Teacher's Journal Book
 */
export function generateFormalJournalHtml(
  journals: TeacherJournal[],
  config: SchoolConfig,
  teacherName: string,
  mapel: string
): string {
  const kop = generateStandardKopHtml(
    config,
    'AGENDA & BUKU JURNAL GURU MENGAJAR',
    `Guru Pengampu: ${teacherName} | Mata Pelajaran: ${mapel} | Semester ${config.semesterAktif}`
  );
  const signature = generateSignatureTableHtml(
    config,
    teacherName,
    '',
    `Guru Pengampu ${mapel}`
  );

  const rows = journals
    .map(
      (j, i) => `
    <tr>
      <td style="text-align:center; padding: 6px;">${i + 1}</td>
      <td style="padding: 6px; font-weight:bold;">${j.tanggal}<br/><span style="font-size:9pt; font-weight:normal;">Jam: ${j.jamKe}</span></td>
      <td style="text-align:center; padding: 6px; font-weight:bold;">${j.kelas}</td>
      <td style="padding: 6px;">${j.materiPokok}</td>
      <td style="padding: 6px; font-size: 9pt;">${j.kegiatanPembelajaran}</td>
      <td style="padding: 6px; font-size: 9pt;">${j.refleksiDanTindakLanjut}</td>
      <td style="text-align:center; padding: 6px; font-weight:bold;">${j.jumlahHadir} / ${j.jumlahHadir + j.jumlahTidakHadir}</td>
    </tr>
  `
    )
    .join('');

  return `
    ${kop}
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 9.5pt;" border="1">
      <thead>
        <tr style="background-color: #f0f0f0; text-align: center; font-weight: bold;">
          <th style="width: 30px; padding: 6px;">No</th>
          <th style="width: 85px; padding: 6px;">Hari/Tgl</th>
          <th style="width: 60px; padding: 6px;">Kelas</th>
          <th style="width: 140px; padding: 6px;">Materi / TP</th>
          <th style="padding: 6px;">Kegiatan Pembelajaran (Deep Learning)</th>
          <th style="width: 140px; padding: 6px;">Refleksi & Karakter Cinta</th>
          <th style="width: 60px; padding: 6px;">Hadir</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
    ${signature}
  `;
}

/**
 * Generate formal HTML for Grade Sheet
 */
export function generateFormalGradesHtml(
  grades: StudentGradeRecord[],
  config: SchoolConfig,
  mapel: string,
  kelas: string,
  teacherName: string
): string {
  const kop = generateStandardKopHtml(
    config,
    'DAFTAR NILAI & ASESMEN KURIKULUM MERDEKA',
    `Mata Pelajaran: ${mapel} | Kelas: ${kelas} | Semester: ${config.semesterAktif} | TP: ${config.tahunPelajaran}`
  );
  const signature = generateSignatureTableHtml(
    config,
    teacherName,
    '',
    `Guru Pengampu ${mapel}`
  );

  const rows = grades
    .map(
      (g, i) => `
    <tr>
      <td style="text-align:center; padding: 5px;">${i + 1}</td>
      <td style="padding: 5px; font-family:monospace;">${g.nisn}</td>
      <td style="padding: 5px; font-weight:bold;">${g.studentName}</td>
      <td style="text-align:center; padding: 5px;">${g.grades.tp1}</td>
      <td style="text-align:center; padding: 5px;">${g.grades.tp2}</td>
      <td style="text-align:center; padding: 5px;">${g.grades.tp3}</td>
      <td style="text-align:center; padding: 5px;">${g.grades.tp4}</td>
      <td style="text-align:center; padding: 5px; font-weight:bold; background-color:#f9fafb;">${g.grades.avgFormatif}</td>
      <td style="text-align:center; padding: 5px;">${g.grades.sumatifLM1}</td>
      <td style="text-align:center; padding: 5px;">${g.grades.sumatifLM2}</td>
      <td style="text-align:center; padding: 5px;">${g.grades.sumatifLM3}</td>
      <td style="text-align:center; padding: 5px; font-weight:bold; background-color:#f9fafb;">${g.grades.avgSumatifLM}</td>
      <td style="text-align:center; padding: 5px;">${g.grades.sas}</td>
      <td style="text-align:center; padding: 5px; font-weight:bold; font-size:11pt; background-color:#eff6ff;">${g.grades.nilaiAkhir}</td>
      <td style="text-align:center; padding: 5px; font-weight:bold;">${g.grades.predikat}</td>
    </tr>
  `
    )
    .join('');

  return `
    ${kop}
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 9pt;" border="1">
      <thead>
        <tr style="background-color: #e5e7eb; text-align: center; font-weight: bold;">
          <th rowspan="2" style="width: 25px; padding: 4px;">No</th>
          <th rowspan="2" style="width: 80px; padding: 4px;">NISN</th>
          <th rowspan="2" style="padding: 4px; text-align:left;">Nama Peserta Didik</th>
          <th colspan="5" style="padding: 4px;">Asesmen Formatif (TP)</th>
          <th colspan="4" style="padding: 4px;">Asesmen Sumatif Lingkup Materi</th>
          <th rowspan="2" style="width: 40px; padding: 4px;">SAS</th>
          <th rowspan="2" style="width: 45px; padding: 4px; background-color:#dbeafe;">NA</th>
          <th rowspan="2" style="width: 35px; padding: 4px;">Pred</th>
        </tr>
        <tr style="background-color: #f3f4f6; text-align: center; font-size: 8pt;">
          <th style="width: 30px; padding: 2px;">TP1</th>
          <th style="width: 30px; padding: 2px;">TP2</th>
          <th style="width: 30px; padding: 2px;">TP3</th>
          <th style="width: 30px; padding: 2px;">TP4</th>
          <th style="width: 35px; padding: 2px; font-weight:bold;">Rata</th>
          <th style="width: 30px; padding: 2px;">LM1</th>
          <th style="width: 30px; padding: 2px;">LM2</th>
          <th style="width: 30px; padding: 2px;">LM3</th>
          <th style="width: 35px; padding: 2px; font-weight:bold;">Rata</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
    ${signature}
  `;
}

/**
 * Styles used for Word Export (.doc) and PDF/Print render
 */
export function getDocumentStyles(isLandscape: boolean = false): string {
  return `
  @page {
    size: ${isLandscape ? 'A4 landscape' : 'A4 portrait'};
    margin: 20mm 15mm 20mm 15mm;
  }
  body {
    font-family: 'Times New Roman', Times, serif;
    font-size: 11pt;
    line-height: 1.5;
    color: #111;
    background: #fff;
  }
  h1, h2, h3, h4, h5, h6 {
    font-family: 'Times New Roman', Times, serif;
    color: #000;
  }
  table.content-table {
    width: 100%;
    border-collapse: collapse;
    margin: 14px 0;
    font-size: 10pt;
  }
  table.content-table th, table.content-table td {
    border: 1px solid #1f2937;
    padding: 6px 8px;
    vertical-align: top;
  }
  table.content-table th {
    background-color: #f3f4f6;
    font-weight: bold;
    text-align: center;
  }
  table.signature-table {
    width: 100% !important;
    border: none !important;
    border-collapse: collapse !important;
    margin-top: 30px !important;
  }
  table.signature-table td {
    border: none !important;
  }
  .highlight-badge {
    display: inline-block;
    padding: 2px 6px;
    font-size: 9pt;
    font-weight: bold;
    border-radius: 4px;
    margin-right: 4px;
  }
  .badge-love {
    background-color: #fee2e2;
    color: #991b1b;
    border: 1px solid #f87171;
  }
  .badge-ppra {
    background-color: #ecfdf5;
    color: #065f46;
    border: 1px solid #6ee7b7;
  }
  .badge-dimensi {
    background-color: #eff6ff;
    color: #1e40af;
    border: 1px solid #93c5fd;
  }
  .answer-line {
    display: block;
    width: 100%;
    border-bottom: 1px dashed #9ca3af;
    height: 22px;
    margin: 4px 0;
  }
  @media print {
    body {
      background: white !important;
      padding: 0 !important;
    }
    .no-print {
      display: none !important;
    }
    .print-container {
      width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      box-shadow: none !important;
      border: none !important;
    }
  }
  `;
}

/**
 * Downloads formatted document as Microsoft Word (.doc) file
 */
export function downloadDocFile(filename: string, contentHtml: string, isLandscape: boolean = false): void {
  const styles = getDocumentStyles(isLandscape);
  const fullHtml = `
  <!DOCTYPE html>
  <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
  <head>
    <meta charset='utf-8'>
    <title>${filename}</title>
    <!--[if gte mso 9]>
    <xml>
      <w:WordDocument>
        <w:View>Print</w:View>
        <w:Zoom>100</w:Zoom>
        <w:DoNotOptimizeForBrowser/>
      </w:WordDocument>
    </xml>
    <![endif]-->
    <style>
      ${styles}
    </style>
  </head>
  <body>
    ${contentHtml}
  </body>
  </html>
  `;

  const blob = new Blob(['\ufeff', fullHtml], {
    type: 'application/msword;charset=utf-8',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.doc') ? filename : `${filename}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copies clean document HTML to clipboard
 */
export async function copyHtmlToClipboard(htmlContent: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(htmlContent);
    return true;
  } catch (err) {
    console.error('Failed to copy html: ', err);
    return false;
  }
}
