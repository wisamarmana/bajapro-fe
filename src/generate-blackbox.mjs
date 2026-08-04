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
      cell(fitur,{width:30}),
      cell(harapan,{width:30}),
      cell('',{width:20}),
      cell('',{width:15})
    ]
  });
}

function makeTable(rows) {
  const hdr = headerRow([
    {text:'No',w:5},{text:'Fitur',w:30},{text:'Hasil yang Diharapkan',w:30},
    {text:'Hasil yang Diperoleh',w:20},{text:'Hasil Tes',w:15}
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
  ['Login dengan email dan password valid','Berhasil login, redirect ke halaman Dashboard Admin'],
  ['Menambah user baru (Admin/Pengajar/Pelajar) dengan data lengkap dan valid','User berhasil ditambahkan dan muncul di tabel List User'],
  ['Mengedit data user yang sudah ada','Data user berhasil diperbarui sesuai perubahan'],
  ['Menghapus user dari sistem','User berhasil dihapus dari daftar'],
  ['Melihat detail user','Modal detail user muncul dengan informasi lengkap'],
  ['Mencari user berdasarkan nama','Tabel menampilkan user sesuai kata kunci pencarian'],
  ['Memfilter user berdasarkan Role','Tabel hanya menampilkan user dengan role yang dipilih'],
  ['Memfilter user berdasarkan Instansi','Tabel hanya menampilkan user dari instansi yang dipilih'],
  ['Menambah kelas baru dengan nama kelas, nama sekolah, dan kode kelas','Kelas berhasil ditambahkan ke daftar'],
  ['Generate kode kelas secara otomatis','Kode kelas 6 karakter alfanumerik terisi otomatis di field kode kelas'],
  ['Mengedit data kelas','Data kelas berhasil diperbarui'],
  ['Menghapus kelas','Kelas berhasil dihapus dari daftar'],
  ['Melihat detail kelas beserta daftar siswa','Modal detail menampilkan info kelas dan tabel siswa di dalamnya'],
  ['Menambah course baru dengan nama, deskripsi, dan thumbnail valid (PNG/JPG, <2MB)','Course berhasil disimpan dengan thumbnail tampil di preview'],
  ['Mengedit course (nama, deskripsi, thumbnail)','Perubahan tersimpan dan tampil sesuai data baru'],
  ['Menambah Lesson dan Sub Lesson baru','Lesson/Sub Lesson berhasil ditambahkan ke course'],
  ['Menambah section materi teks menggunakan Tiptap Editor','Konten materi tersimpan dengan format rich text'],
  ['Menambah section materi video (URL YouTube)','URL video tersimpan dan dapat ditampilkan'],
  ['Drag & drop untuk mengubah urutan section materi','Urutan section berubah sesuai posisi baru'],
  ['Menambah soal Code Question untuk Sub Lesson','Soal coding berhasil tersimpan dan terhubung ke sub lesson'],
  ['Menambah soal Essay Question','Soal essay berhasil tersimpan'],
  ['Menambah Level baru dengan nama dan deskripsi','Level berhasil ditambahkan ke daftar'],
  ['Mengedit Level','Data level berhasil diperbarui'],
  ['Menghapus Level','Level berhasil dihapus'],
  ['Menambah Badge baru dengan nama, ikon, skor min, dan skor max','Badge berhasil ditambahkan'],
  ['Mengedit Badge','Data badge berhasil diperbarui'],
  ['Menghapus Badge','Badge berhasil dihapus'],
  ['Approve pengajar yang mendaftar (status Pending)','Status pengajar berubah menjadi Approved'],
  ['Reject pengajar yang mendaftar','Status pengajar berubah menjadi Rejected'],
  ['Bulk Approve beberapa pengajar sekaligus','Semua pengajar terpilih berubah statusnya menjadi Approved'],
  ['Bulk Reject beberapa pengajar sekaligus','Semua pengajar terpilih berubah statusnya menjadi Rejected'],
  ['Melihat Dashboard Admin (statistik pengguna, approval pending, leaderboard)','Dashboard menampilkan data statistik dengan benar'],
  ['Melihat Leaderboard global','Leaderboard menampilkan peringkat siswa berdasarkan total skor'],
  ['Melihat dan mengedit profil Admin','Informasi profil tampil dan berhasil diperbarui'],
  ['Logout dari sistem','Session berakhir, redirect ke halaman Login'],
];

const adminNegative = [
  ['Login dengan email valid tapi password salah','Muncul pesan error "Email atau password salah"'],
  ['Login dengan email tidak terdaftar','Muncul pesan error credential tidak valid'],
  ['Login dengan field email kosong','Validasi form: "Email wajib diisi"'],
  ['Login dengan field password kosong','Validasi form: "Password wajib diisi"'],
  ['Login dengan format email tidak valid (tanpa @)','Validasi form: "Format email salah"'],
  ['Menambah user tanpa mengisi nama','Validasi form: field nama wajib diisi'],
  ['Menambah user tanpa memilih role','Validasi form: role wajib dipilih'],
  ['Menambah user dengan email yang sudah terdaftar','Muncul pesan error email sudah digunakan'],
  ['Menambah user dengan format email tidak valid','Validasi form: "Email tidak valid"'],
  ['Menambah user Students tanpa memilih kelas','Validasi form: "Kelas wajib dipilih!"'],
  ['Menambah user Teacher tanpa mengisi instansi','Validasi form: "Instansi/Sekolah wajib diisi!"'],
  ['Menambah kelas tanpa mengisi nama kelas','Validasi form: "Nama kelas wajib diisi!"'],
  ['Menambah kelas tanpa mengisi nama instansi','Validasi form: "Nama instansi wajib diisi!"'],
  ['Menambah kelas tanpa kode kelas','Validasi form: "Kode kelas wajib diisi atau di-generate!"'],
  ['Menambah course tanpa nama course','Validasi form: "Nama course wajib diisi!"'],
  ['Menambah course tanpa deskripsi','Validasi form: "Deskripsi wajib diisi!"'],
  ['Upload thumbnail course dengan format file selain PNG/JPG (misal .PDF)','Muncul pesan error "Hanya bisa upload file PNG/JPG/JPEG!"'],
  ['Upload thumbnail course dengan ukuran >2MB','Muncul pesan error "Ukuran gambar maksimal 2MB!"'],
  ['Upload ikon badge dengan format selain JPG/PNG','Muncul pesan error "Hanya bisa upload file JPG atau PNG"'],
  ['Upload ikon badge dengan ukuran >2MB','Muncul pesan error "Ukuran gambar maksimal 2MB"'],
  ['Menambah badge tanpa mengisi skor minimal','Validasi form: "Wajib diisi!"'],
  ['Menambah badge tanpa mengisi skor maksimal','Validasi form: "Wajib diisi!"'],
  ['Menambah level tanpa nama level','Validasi form: "Nama level wajib diisi!"'],
  ['Menambah level tanpa deskripsi','Validasi form: "Deskripsi wajib diisi!"'],
];

const adminEdge = [
  ['Login dengan password hanya 1 karakter','Sistem memproses login, menampilkan error credential jika tidak cocok'],
  ['Menambah user dengan nama berisi 1 karakter','User berhasil ditambahkan (batas minimal nama)'],
  ['Menambah user dengan nama sangat panjang (>255 karakter)','Sistem menangani dengan memotong atau menolak input'],
  ['Menambah user dengan email berformat edge case (user@a.co)','Sistem menerima email valid walaupun domain pendek'],
  ['Menambah kelas dengan nama berisi karakter spesial (!@#$%^&*)','Kelas ditambahkan atau ditolak sesuai validasi backend'],
  ['Menambah badge dengan skor minimal = skor maksimal','Badge tersimpan dengan rentang skor tunggal'],
  ['Menambah badge dengan skor minimal > skor maksimal','Sistem menolak atau memberikan pesan error'],
  ['Menambah badge dengan skor minimal = 0','Badge tersimpan dengan skor minimal nol'],
  ['Menghapus user saat user tersebut sedang login di sesi lain','User terhapus, sesi lain menjadi invalid'],
  ['Approve pengajar yang sudah berstatus Approved','Tombol Approve disabled, tidak ada perubahan'],
  ['Mengakses halaman admin tanpa login (langsung URL)','Redirect ke halaman Login'],
  ['Upload thumbnail dengan ukuran tepat 2MB (boundary)','File berhasil diupload (tepat di batas maksimum)'],
  ['Menambah course dengan deskripsi hanya berisi spasi','Validasi menolak atau menyimpan string kosong'],
  ['Menambah Sub Lesson tanpa menambahkan section materi apapun','Sub Lesson tersimpan tanpa konten materi (empty state)'],
];

// =================== PENGAJAR SCENARIOS ===================
const pengajarPositive = [
  ['Login dengan email dan password valid (akun sudah di-approve)','Berhasil login, redirect ke Dashboard Pengajar'],
  ['Melihat Dashboard Pengajar (statistik kelas, siswa, tugas pending)','Dashboard menampilkan data statistik kelas pengajar'],
  ['Menambah kelas baru','Kelas berhasil ditambahkan dan muncul di daftar kelas pengajar'],
  ['Mengedit kelas milik sendiri','Data kelas berhasil diperbarui'],
  ['Menghapus kelas milik sendiri','Kelas berhasil dihapus'],
  ['Generate kode kelas otomatis','Kode kelas terisi otomatis 6 karakter alfanumerik'],
  ['Melihat detail kelas dan daftar siswa di dalamnya','Modal detail menampilkan informasi kelas dan tabel siswa'],
  ['Menambah user pelajar baru ke dalam kelas','Pelajar berhasil ditambahkan dengan role Students'],
  ['Melihat daftar user (hanya siswa di kelas sendiri)','Tabel menampilkan siswa yang terdaftar di kelas pengajar'],
  ['Melihat Laporan Perkembangan Siswa per Sub Lesson','Data laporan siswa tampil dengan skor wondering, exploring, explain'],
  ['Approve jawaban essay siswa dengan memberikan nilai','Jawaban di-approve, status berubah menjadi Approved'],
  ['Reject jawaban essay siswa dengan catatan penolakan','Jawaban di-reject, catatan tersimpan untuk setiap pertanyaan'],
  ['Mengubah nilai essay siswa sebelum approve','Nilai berhasil diperbarui sesuai input pengajar'],
  ['Melihat Leaderboard siswa di kelas sendiri','Leaderboard menampilkan peringkat siswa berdasarkan skor'],
  ['Melihat dan mengedit profil pengajar','Profil tampil dan berhasil diperbarui'],
  ['Logout dari sistem','Session berakhir, redirect ke halaman Login'],
];

const pengajarNegative = [
  ['Login dengan akun pengajar yang belum di-approve','Redirect ke halaman Waiting Approval'],
  ['Login dengan password salah','Muncul pesan error credential tidak valid'],
  ['Menambah pelajar tanpa memilih kelas','Validasi form: "Kelas wajib dipilih!"'],
  ['Menambah pelajar dengan email yang sudah terdaftar','Muncul pesan error email sudah digunakan'],
  ['Menambah kelas tanpa nama kelas','Validasi form: "Nama kelas wajib diisi!"'],
  ['Menambah kelas tanpa nama instansi','Validasi form: "Nama instansi wajib diisi!"'],
  ['Reject jawaban essay tanpa mengisi catatan penolakan','Muncul pesan error "Semua catatan wajib diisi saat melakukan Reject!"'],
  ['Reject jawaban essay dengan salah satu catatan kosong','Validasi gagal: semua field catatan wajib terisi'],
  ['Approve jawaban essay yang tidak memiliki data jawaban','Muncul pesan error "Jawaban esai tidak ditemukan!"'],
  ['Mengakses halaman yang tidak memiliki izin (misal: manajemen role)','Muncul pesan "Akses Ditolak"'],
  ['Mencoba mengedit course tanpa permission course.update','Form dalam mode read-only, tombol simpan tidak muncul'],
];

const pengajarEdge = [
  ['Cek status approval dengan email yang tidak terdaftar sebagai pengajar','Muncul pesan "Data pengajar dengan email tersebut tidak ditemukan"'],
  ['Cek status approval dengan field email kosong','Muncul pesan "Silakan masukkan email Anda"'],
  ['Memberikan nilai essay = 0 untuk semua kriteria','Nilai tersimpan dengan skor 0'],
  ['Memberikan nilai essay = 100 untuk semua kriteria','Nilai tersimpan dengan skor maksimum'],
  ['Memberikan nilai essay negatif (-1)','Sistem menolak input atau mengubah ke 0 (boundary min=0)'],
  ['Memberikan nilai essay > 100','Sistem menolak input atau membatasi ke 100 (boundary max=100)'],
  ['Approve jawaban yang sudah berstatus Approved sebelumnya','Tombol Approve/Reject tidak muncul (status === 1)'],
  ['Melihat laporan siswa yang belum memulai modul apapun','Muncul pesan "Data laporan tidak ditemukan atau siswa belum memulai modul ini"'],
  ['Pengajar hanya melihat kelas miliknya (teacher_id filter)','Kelas pengajar lain tidak tampil di daftar'],
];

// =================== PELAJAR SCENARIOS ===================
const pelajarPositive = [
  ['Registrasi sebagai Student dengan nama, email, dan password valid','Akun berhasil dibuat, redirect ke Dashboard Pelajar'],
  ['Registrasi Student dengan mengisi Kode Kelas valid','Akun terdaftar dan otomatis tergabung ke kelas terkait'],
  ['Registrasi Student tanpa mengisi Kode Kelas (opsional)','Akun berhasil dibuat tanpa kelas (class_id = null)'],
  ['Login dengan email dan password valid','Berhasil login, redirect ke Dashboard Pelajar'],
  ['Melihat Dashboard Pelajar (progress, badge, leaderboard)','Dashboard menampilkan enrolled courses, progress, dan achievement'],
  ['Melihat daftar course yang tersedia','Semua course aktif ditampilkan dengan thumbnail dan jumlah bab'],
  ['Enroll course baru','Pelajar terdaftar di course, tombol berubah menjadi Resume'],
  ['Resume course yang sudah di-enroll','Pelajar masuk ke halaman level/materi terakhir'],
  ['Melihat materi teks di Sub Lesson','Konten materi rich text ditampilkan dengan benar'],
  ['Menonton video pembelajaran (YouTube)','Video player menampilkan video sesuai URL'],
  ['Mengerjakan soal Code Question (Coding Test) menggunakan compiler','Compiler mengeksekusi kode Java dan menampilkan output'],
  ['Submit kode yang benar pada Coding Test','Kode diterima, skor exploring terupdate, progress ditandai completed'],
  ['Menjawab soal Essay','Jawaban essay tersimpan dan menunggu approval pengajar'],
  ['Melihat Report per Course (skor per sub lesson)','Tabel report menampilkan readScore, codingScore, essayScore, totalScore'],
  ['Melihat Detail Report per Sub Lesson','Detail menampilkan wondering, exploring, explain score dan status'],
  ['Melihat Leaderboard','Leaderboard menampilkan peringkat pelajar berdasarkan total skor'],
  ['Melihat achievement (Badge dan Rank)','Badge dan peringkat sesuai dengan total skor akumulatif'],
  ['Melihat progress keseluruhan (persentase)','Persentase progress dihitung dari sub lesson completed / total'],
  ['Melihat profil pelajar','Informasi profil pelajar ditampilkan'],
  ['Logout dari sistem','Session berakhir, redirect ke halaman Login'],
];

const pelajarNegative = [
  ['Registrasi tanpa mengisi nama','Validasi form: "Wajib diisi"'],
  ['Registrasi tanpa mengisi email','Validasi form: "Wajib diisi"'],
  ['Registrasi dengan format email tidak valid','Validasi form: "Email tidak valid"'],
  ['Registrasi tanpa mengisi password','Validasi form: "Password wajib diisi"'],
  ['Registrasi tanpa mengisi konfirmasi password','Validasi form: "Konfirmasi password wajib diisi"'],
  ['Registrasi dengan password dan konfirmasi password tidak sama','Validasi form: "Password tidak sama!"'],
  ['Registrasi dengan email yang sudah terdaftar','Muncul pesan error dari server bahwa email sudah digunakan'],
  ['Registrasi Student dengan Kode Kelas yang tidak valid/tidak ada','Sistem tidak menemukan kelas, class_id tetap null'],
  ['Login dengan password salah','Muncul pesan error credential tidak valid'],
  ['Login dengan email tidak terdaftar','Muncul pesan error credential tidak valid'],
  ['Submit kode Java yang mengandung syntax error','Compiler menampilkan pesan error spesifik dari kompilasi'],
  ['Submit kode Java kosong (tanpa kode)','Compiler mengembalikan error atau pesan kosong'],
  ['Mengakses halaman admin tanpa role admin','Redirect atau muncul pesan Akses Ditolak'],
  ['Mengakses course dengan ID yang tidak ada','Muncul pesan "Course not found" atau halaman 404'],
];

const pelajarEdge = [
  ['Registrasi dengan password hanya 1 karakter','Sistem menerima atau menolak sesuai kebijakan minimal password'],
  ['Registrasi dengan nama berisi 1 karakter','Sistem menerima input (boundary minimal)'],
  ['Registrasi dengan nama sangat panjang (>255 karakter)','Sistem memotong atau menolak input'],
  ['Registrasi sebagai Teacher dengan NIP dan Instansi (dari tab Teacher)','Akun pengajar dibuat, menunggu approval jika fitur aktif'],
  ['Submit kode Java dengan infinite loop','Compiler timeout dan mengembalikan pesan error timeout'],
  ['Submit jawaban essay dengan teks sangat panjang (>5000 karakter)','Jawaban tersimpan atau dipotong sesuai batas database'],
  ['Submit jawaban essay dengan hanya spasi/whitespace','Sistem menerima atau menolak jawaban kosong'],
  ['Enroll course yang sudah di-enroll sebelumnya','Tidak ada duplikasi, tetap menampilkan data enrollment lama'],
  ['Melihat Leaderboard saat belum ada siswa lain yang terdaftar','Leaderboard menampilkan hanya data pelajar sendiri atau kosong'],
  ['Melihat report course yang belum dimulai (0% progress)','Report menampilkan semua sub lesson dengan skor 0 dan status Pending'],
  ['Melihat detail report sub lesson yang essay-nya di-reject','Status menampilkan Rejected, skor essay sesuai penilaian pengajar'],
  ['Melihat Dashboard saat belum enroll course apapun','Dashboard menampilkan 0 enrolled, 0% progress, badge Beginner'],
  ['Akses materi dengan studentId=undefined (belum login sempurna)','Sistem mengembalikan error "Invalid student ID" (400)'],
];

// Build document
function buildSection(title, positive, negative, edge) {
  const items = [];
  items.push(heading(title));
  
  items.push(subheading('A. Positive Testing (Skenario Sukses/Normal)'));
  items.push(makeTable(positive.map((r,i) => dataRow(i+1, r[0], r[1]))));
  
  items.push(subheading('B. Negative Testing (Skenario Error/Tidak Valid)'));
  items.push(makeTable(negative.map((r,i) => dataRow(i+1, r[0], r[1]))));
  
  items.push(subheading('C. Edge Cases (Skenario Batas Ekstrem)'));
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
        alignment: AlignmentType.CENTER, spacing:{after:100},
        children:[new TextRun({text:'DOKUMEN BLACKBOX TESTING', bold:true, size:28, font:'Times New Roman'})]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER, spacing:{after:100},
        children:[new TextRun({text:'SISTEM BAJAPRO', bold:true, size:28, font:'Times New Roman'})]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER, spacing:{after:50},
        children:[new TextRun({text:'(Platform E-Course Pembelajaran Java Interaktif)', size:22, font:'Times New Roman', italics:true})]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER, spacing:{after:200},
        children:[new TextRun({text:'Menggunakan Teknik: Equivalence Partitioning, Boundary Value Analysis, dan Error Guessing', size:20, font:'Times New Roman'})]
      }),
      new Paragraph({spacing:{after:100},
        children:[new TextRun({text:'Dokumen ini merancang skenario pengujian blackbox untuk sistem BAJAPRO yang mencakup tiga role pengguna: Admin, Pengajar, dan Pelajar. Setiap bagian memuat Positive Testing, Negative Testing, dan Edge Cases berdasarkan teknik Equivalence Partitioning (EP), Boundary Value Analysis (BVA), dan Error Guessing (EG).', size:22, font:'Times New Roman'})]
      }),
      new Paragraph({spacing:{after:50},
        children:[new TextRun({text:'Keterangan kolom:', bold:true, size:22, font:'Times New Roman'})]
      }),
      new Paragraph({children:[new TextRun({text:'• Hasil yang Diharapkan: Output/perilaku sistem yang seharusnya terjadi', size:20, font:'Times New Roman'})]}),
      new Paragraph({children:[new TextRun({text:'• Hasil yang Diperoleh: Diisi saat pengujian dilakukan (observasi aktual)', size:20, font:'Times New Roman'})]}),
      new Paragraph({spacing:{after:200},children:[new TextRun({text:'• Hasil Tes: Diisi Pass/Fail berdasarkan perbandingan', size:20, font:'Times New Roman'})]}),

      ...buildSection('1. ROLE: ADMIN', adminPositive, adminNegative, adminEdge),
      ...buildSection('2. ROLE: PENGAJAR', pengajarPositive, pengajarNegative, pengajarEdge),
      ...buildSection('3. ROLE: PELAJAR', pelajarPositive, pelajarNegative, pelajarEdge),
    ]
  }]
});

const buffer = await Packer.toBuffer(doc);
const outputPath = 'e:\\\\bajapro-fe\\\\Blackbox_Testing_BAJAPRO.docx';
fs.writeFileSync(outputPath, buffer);
console.log('Document generated:', outputPath);
