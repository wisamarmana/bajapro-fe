import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, WidthType, AlignmentType, HeadingLevel, BorderStyle, VerticalAlign } from 'docx';
import fs from 'fs';

const B = BorderStyle.SINGLE;
const borders = { top:{style:B,size:1}, bottom:{style:B,size:1}, left:{style:B,size:1}, right:{style:B,size:1} };

function cell(text, opts={}) {
  return new TableCell({
    borders,
    verticalAlign: VerticalAlign.CENTER,
    width: opts.width ? {size:opts.width,type:WidthType.PERCENTAGE} : undefined,
    children:[new Paragraph({
      alignment: opts.center ? AlignmentType.CENTER : AlignmentType.LEFT,
      spacing: { before: 100, after: 100 },
      children:[new TextRun({text:String(text), bold:!!opts.bold, size:22, font:'Times New Roman'})]
    })]
  });
}

function headerRow(cols) {
  return new TableRow({
    tableHeader:true,
    children: cols.map(c => cell(c.text, {bold:true, center:true, width:c.w}))
  });
}

function dataRow(no, role, request, currentFeature, status) {
  return new TableRow({
    children:[
      cell(no, {center:true, width:5}),
      cell(role, {center:true, width:15}),
      cell(request, {width:30}),
      cell(currentFeature, {width:35}),
      cell(status, {center:true, width:15})
    ]
  });
}

function makeTable(rows) {
  const hdr = headerRow([
    {text:'No', w:5},
    {text:'User Segment', w:15},
    {text:'Request User (Hasil Wawancara)', w:30},
    {text:'Fitur Saat Ini yang Meng-cover', w:35},
    {text:'Status', w:15}
  ]);
  return new Table({
    width:{size:100,type:WidthType.PERCENTAGE},
    rows:[hdr, ...rows]
  });
}

function heading(text, level=HeadingLevel.HEADING_2) {
  return new Paragraph({heading:level, spacing:{before:300,after:100},
    children:[new TextRun({text,bold:true,size:28,font:'Times New Roman'})]
  });
}

// Data Gabungan
const gapData = [
  ['1', 'Pengajar', 'Melihat daftar nilai dan peringkat mahasiswa secara keseluruhan.', 'Fitur Leaderboard sudah ada dan menampilkan urutan Rank, Nama, dan Skor total.', 'Terpenuhi'],
  ['2', 'Pengajar', 'Keterangan Tahun Ajaran atau Kelas di Leaderboard untuk membedakan mahasiswa antar angkatan/kelas.', 'Pada manajemen Kelas dan tabel Database hanya terdapat nama kelas (class_name) tanpa atribut penanda tahun ajaran. Tidak ada filter tahun ajaran di Leaderboard.', 'Belum Terpenuhi'],
  ['3', 'Pengajar', 'Pengelolaan dan rekapitulasi nilai untuk kebutuhan laporan dosen/pengajar.', 'Sistem memiliki halaman Report per course & sub-lesson, namun belum memiliki fitur export data (Download ke Excel/CSV).', 'Terpenuhi Sebagian'],
  ['4', 'Admin', 'Manajemen user yang lebih efisien ketika tahun ajaran baru.', 'Terdapat fitur CRUD user secara satuan (UsersManager.tsx), namun tidak ada fitur Bulk Action (hapus massal/ubah kelas massal) atau Import Excel.', 'Terpenuhi Sebagian'],
  ['5', 'Pelajar (Mhs/SMK)', 'Panduan navigasi awal karena bingung saat pertama kali login harus klik apa.', 'Hanya ada UI standar tanpa ada pop-up petunjuk (Onboarding Tour/Tooltip) di halaman pertama.', 'Belum Terpenuhi'],
  ['6', 'Pelajar (Mhs/SMK)', 'Materi yang tidak terlalu panjang dalam 1 halaman agar tidak bosan membaca.', 'Pengajar dapat membagi materi per-section (Sub-Lesson) dengan Tiptap editor.', 'Terpenuhi'],
  ['7', 'Pelajar (Mhs/SMK)', 'Kejelasan fungsi kapan harus mengetes kode dan kapan mengirim tugas di Compiler.', 'Tombol "Run" dan "Submit" sudah ada, tapi desain UI tidak membedakan secara jelas fungsinya, sehingga membingungkan pemula.', 'Terpenuhi Sebagian'],
  ['8', 'Pelajar (Mhs/SMK)', 'Pesan error compiler (Feedback) yang mudah dimengerti.', 'Error teknis dari eksekusi Python/Java ditampilkan secara raw (stack trace), belum diterjemahkan ke kalimat ramah pengguna.', 'Terpenuhi Sebagian'],
  ['9', 'Pelajar (Mhs/SMK)', 'Mengetahui dengan jelas kenapa skor akhir belum keluar/bertambah.', 'Belum ada indikator visual "Menunggu Penilaian Pengajar" pada halaman hasil nilai essay.', 'Belum Terpenuhi'],
];

const doc = new Document({
  sections: [{
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER, spacing:{after:300},
        children:[new TextRun({text:'ANALISIS KEBUTUHAN SISTEM BAJAPRO BERDASARKAN WAWANCARA', bold:true, size:28, font:'Times New Roman'})]
      }),
      
      heading('1. Tabel Analisis Kesesuaian Kebutuhan (Gap Analysis)'),
      new Paragraph({
        spacing:{before:50,after:150},
        children:[new TextRun({text:'Tabel di bawah ini membandingkan hasil wawancara dari segmen Pengajar dan Pelajar dengan ketersediaan fitur pada sistem BAJAPRO saat ini.', size:24, font:'Times New Roman'})]
      }),
      
      makeTable(gapData.map(r => dataRow(r[0],r[1],r[2],r[3],r[4]))),
      
      heading('2. Kebutuhan Fungsional Usulan (Functional Requirements)'),
      new Paragraph({
        spacing:{before:50,after:50},
        children:[new TextRun({text:'Berdasarkan fitur yang berstatus "Belum Terpenuhi" dan "Terpenuhi Sebagian", berikut adalah rincian Kebutuhan Fungsional yang harus ditambahkan:', size:24, font:'Times New Roman'})]
      }),
      new Paragraph({children:[new TextRun({text:'FR-01: Sistem harus menyediakan filter "Tahun Ajaran" dan "Kelas" pada halaman Leaderboard.', size:24, font:'Times New Roman'})]}),
      new Paragraph({children:[new TextRun({text:'FR-02: Sistem harus memiliki field input "Tahun Ajaran" pada saat Admin/Pengajar membuat Kelas baru.', size:24, font:'Times New Roman'})]}),
      new Paragraph({children:[new TextRun({text:'FR-03: Sistem harus menyediakan fitur Export data nilai mahasiswa ke dalam format CSV/Excel.', size:24, font:'Times New Roman'})]}),
      new Paragraph({children:[new TextRun({text:'FR-04: Sistem harus menyediakan fungsionalitas Bulk Action (seperti hapus massal atau naik kelas) pada Manajemen User.', size:24, font:'Times New Roman'})]}),
      new Paragraph({children:[new TextRun({text:'FR-05: Sistem harus menampilkan Pop-up Onboarding/Tutorial Awal bagi pengguna yang baru pertama kali masuk ke dashboard.', size:24, font:'Times New Roman'})]}),
      new Paragraph({children:[new TextRun({text:'FR-06: Sistem harus menampilkan validasi konfirmasi (pop-up) untuk menjelaskan fungsi tombol "Run" vs "Submit" di halaman Compiler.', size:24, font:'Times New Roman'})]}),
      new Paragraph({children:[new TextRun({text:'FR-07: Sistem harus menyediakan pesan error (Feedback) compiler yang diterjemahkan ke dalam bahasa Indonesia yang lebih sederhana dan mudah dipahami.', size:24, font:'Times New Roman'})]}),
      new Paragraph({children:[new TextRun({text:'FR-08: Sistem harus menampilkan notifikasi atau keterangan "Menunggu Penilaian Pengajar" pada halaman nilai jika essay belum di-approve.', size:24, font:'Times New Roman'})]}),
    ]
  }]
});

const buffer = await Packer.toBuffer(doc);
const outputPath = 'e:\\\\bajapro-fe\\\\Analisis_Kebutuhan_Wawancara_Tabel.docx';
fs.writeFileSync(outputPath, buffer);
console.log('Document generated:', outputPath);
