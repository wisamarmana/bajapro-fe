import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, WidthType, AlignmentType, HeadingLevel, BorderStyle } from 'docx';
import fs from 'fs';

const B = BorderStyle.SINGLE;
const borders = { top:{style:B,size:1}, bottom:{style:B,size:1}, left:{style:B,size:1}, right:{style:B,size:1} };

function cell(text, opts={}) {
  return new TableCell({
    borders,
    width: opts.width ? {size:opts.width,type:WidthType.PERCENTAGE} : undefined,
    children:[new Paragraph({
      alignment: opts.center ? AlignmentType.CENTER : AlignmentType.LEFT,
      children:[new TextRun({text:String(text), bold:!!opts.bold, size:20, font:'Times New Roman'})]
    })]
  });
}

function headerRow(cols) {
  return new TableRow({
    tableHeader:true,
    children: cols.map(c => cell(c.text, {bold:true, center:true, width:c.w}))
  });
}

function dataRow(no, fitur, harapan) {
  return new TableRow({
    children:[
      cell(no,{center:true,width:5}),
      cell(fitur,{width:35}),
      cell(harapan,{width:35}),
      cell('',{width:15}),
      cell('',{width:10})
    ]
  });
}

function makeTable(rows) {
  const hdr = headerRow([
    {text:'No',w:5},{text:'Fitur',w:35},{text:'Hasil yang Diharapkan',w:35},
    {text:'Hasil Aktual',w:15},{text:'Status',w:10}
  ]);
  return new Table({
    width:{size:100,type:WidthType.PERCENTAGE},
    rows:[hdr, ...rows]
  });
}

function heading(text, level=HeadingLevel.HEADING_2) {
  return new Paragraph({heading:level, spacing:{before:300,after:100},
    children:[new TextRun({text,bold:true,size:24,font:'Times New Roman'})]
  });
}

function subheading(text) {
  return new Paragraph({spacing:{before:200,after:100},
    children:[new TextRun({text,bold:true,italics:true,size:22,font:'Times New Roman'})]
  });
}

// =================== ADMIN SCENARIOS ===================
const adminPositive = [
  ['Login dengan email dan password valid', 'Redirect ke Dashboard Admin'],
  ['Menambah user baru dengan data lengkap', 'User berhasil ditambahkan'],
  ['Menambah kelas baru dengan format valid', 'Kelas berhasil disimpan'],
  ['Menambah course baru dan materi (Video/Teks)', 'Course dan materi tersimpan'],
  ['Approve akun pengajar', 'Status pengajar menjadi Approved'],
];

const adminNegative = [
  ['Login dengan field email atau password kosong', 'Pesan validasi field wajib diisi'],
  ['Login dengan password yang salah', 'Pesan error credential tidak valid'],
  ['Menambah user dengan format email salah', 'Pesan error email tidak valid'],
  ['Upload thumbnail course selain format PNG/JPG', 'Pesan error format file tidak didukung'],
];

const adminEdge = [
  ['Menambah user dengan nama 1 karakter', 'Sistem menerima input tersebut'],
  ['Approve pengajar yang sudah berstatus Approved', 'Tombol Approve disabled'],
];

// =================== PENGAJAR SCENARIOS ===================
const pengajarPositive = [
  ['Login pengajar (akun sudah Approved)', 'Redirect ke Dashboard Pengajar'],
  ['Melihat daftar kelas dan siswa', 'Menampilkan data siswa di kelas pengajar'],
  ['Melihat detail laporan hasil belajar siswa', 'Menampilkan skor coding & essay siswa'],
  ['Approve & berikan nilai essay siswa', 'Nilai tersimpan, status essay menjadi Approved'],
];

const pengajarNegative = [
  ['Login pengajar (akun status Pending)', 'Dialihkan ke halaman Waiting Approval'],
  ['Reject essay tanpa mengisi catatan', 'Muncul error catatan wajib diisi'],
];

const pengajarEdge = [
  ['Memberikan nilai essay 0 untuk semua kriteria', 'Nilai tersimpan dengan total skor 0'],
  ['Melihat laporan siswa yang belum mulai course', 'Sistem menampilkan state laporan kosong'],
];

// =================== PELAJAR SCENARIOS ===================
const pelajarPositive = [
  ['Registrasi akun dengan data dan kode kelas valid', 'Akun terbuat & tergabung ke kelas'],
  ['Login dengan akun valid', 'Redirect ke Dashboard Pelajar'],
  ['Mengerjakan Coding Test dengan kode yang benar', 'Compiler mengembalikan skor maksimal'],
  ['Submit jawaban Essay', 'Jawaban tersimpan menunggu dinilai pengajar'],
];

const pelajarNegative = [
  ['Registrasi dengan password & konfirmasi tidak sama', 'Muncul error password tidak sama'],
  ['Submit kode Java yang mengalami syntax error', 'Compiler menampilkan pesan error syntax'],
];

const pelajarEdge = [
  ['Registrasi dengan kode kelas kosong (opsional)', 'Akun terbuat tanpa kelas (class_id null)'],
  ['Submit kode Java dengan infinite loop', 'Compiler timeout dan mengembalikan error'],
];

function buildSection(title, positive, negative, edge) {
  const items = [];
  items.push(heading(title));
  
  items.push(subheading('A. Positive Testing'));
  items.push(makeTable(positive.map((r,i) => dataRow(i+1, r[0], r[1]))));
  
  items.push(subheading('B. Negative Testing'));
  items.push(makeTable(negative.map((r,i) => dataRow(i+1, r[0], r[1]))));
  
  items.push(subheading('C. Edge Cases'));
  items.push(makeTable(edge.map((r,i) => dataRow(i+1, r[0], r[1]))));
  
  return items;
}

const doc = new Document({
  styles: {
    default: {
      document: { run: { font: 'Times New Roman', size: 24 } }
    }
  },
  sections: [{
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER, spacing:{after:200},
        children:[new TextRun({text:'DOKUMEN BLACKBOX TESTING - BAJAPRO', bold:true, size:28, font:'Times New Roman'})]
      }),
      
      ...buildSection('1. ROLE: ADMIN', adminPositive, adminNegative, adminEdge),
      ...buildSection('2. ROLE: PENGAJAR', pengajarPositive, pengajarNegative, pengajarEdge),
      ...buildSection('3. ROLE: PELAJAR', pelajarPositive, pelajarNegative, pelajarEdge),
    ]
  }]
});

const buffer = await Packer.toBuffer(doc);
const outputPath = 'e:\\\\bajapro-fe\\\\Blackbox_Testing_BAJAPRO_Short.docx';
fs.writeFileSync(outputPath, buffer);
console.log('Document generated:', outputPath);
