"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from 'antd';
import { 
  PlayCircleOutlined, 
  CodeOutlined, 
  ApartmentOutlined, 
  RetweetOutlined, 
  AppstoreOutlined, 
  BulbOutlined, 
  PlayCircleFilled, 
  FileTextFilled, 
  EditFilled, 
  CodeFilled, 
  RobotOutlined,
  UserOutlined, 
  SolutionOutlined, 
  SettingOutlined, 
  CheckCircleFilled, 
  GlobalOutlined, 
  ShareAltOutlined,
  MenuOutlined
} from '@ant-design/icons';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image
            src="/assets/logo/logo-completed.png"
            alt="Logo BAJAPRO"
            width={120}
            height={40}
            style={{ width: "auto", height: "24px", objectFit: "contain" }}
            priority
          />
        </div>
        <nav className="hidden md:flex items-center gap-10 text-sm font-semibold">
          <Link href="/" className="landing-nav-link">Home</Link>
          <Link href="#materi" className="landing-nav-link">Materi</Link>
          <Link href="#aktivitas" className="landing-nav-link">Aktivitas</Link>
        </nav>
        <div className="hidden md:flex items-center gap-4">
          <Link href="/login">
            <Button style={{ color: '#5B21B6', borderColor: '#5B21B6', borderRadius: '8px', fontWeight: 600 }} className="px-4 text-sm">Login</Button>
          </Link>
          <Link href="/register">
            <Button type="primary" style={{ backgroundColor: '#5B21B6', borderRadius: '8px', fontWeight: 600 }} className="px-4 text-sm">Register</Button>
          </Link>
        </div>
        <div className="md:hidden flex items-center">
          <Button type="text" icon={<MenuOutlined style={{ fontSize: '20px', color: '#5B21B6' }} />} onClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
        </div>
      </div>
      {/* Mobile Menu */}
      <div className={`md:hidden absolute top-20 left-0 w-full bg-white border-b border-gray-100 shadow-lg transition-all duration-300 overflow-hidden ${mobileMenuOpen ? 'max-h-[400px] py-4' : 'max-h-0 py-0'}`}>
        <div className="px-6 flex flex-col gap-4">
          <Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-gray-700 hover:text-purple-700">Home</Link>
          <Link href="#materi" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-gray-700 hover:text-purple-700">Materi</Link>
          <Link href="#aktivitas" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-gray-700 hover:text-purple-700">Aktivitas</Link>
          <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
            <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full">
              <Button block style={{ color: '#5B21B6', borderColor: '#5B21B6', borderRadius: '8px', fontWeight: 600 }}>Login</Button>
            </Link>
            <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="w-full">
              <Button block type="primary" style={{ backgroundColor: '#5B21B6', borderRadius: '8px', fontWeight: 600 }}>Register</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

const HeroSection = () => (
  <section className="pt-40 pb-24 px-6 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)' }}>
    <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
      <div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-purple-100 text-purple-700 text-xs font-bold mb-8 shadow-sm">
          <span className="flex items-center justify-center w-5 h-5 bg-purple-100 rounded-full text-[10px]"><PlayCircleOutlined /></span>
          Platform Pembelajaran Java
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-[1.2] mb-4 md:mb-6">
          Kuasai <br className="hidden sm:block"/> Pemrograman Java <br className="hidden sm:block"/> bersama <span className="text-purple-700">BAJAPRO</span>
        </h1>
        <p className="text-base md:text-lg text-gray-600 mb-8 md:mb-10 leading-relaxed max-w-lg font-medium">
          Tingkatkan kemampuan logika dan pemrograman berorientasi objek Anda dengan kurikulum terstruktur.
        </p>
        <div className="flex flex-col sm:flex-row flex-wrap gap-4">
          <Link href="/register" className="w-full sm:w-auto">
            <Button type="primary" size="large" block style={{ backgroundColor: '#5B21B6', borderRadius: '8px', padding: '0 32px', height: '52px', fontWeight: 700, fontSize: '15px' }}>Mulai Belajar Sekarang &rarr;</Button>
          </Link>
          <Link href="#materi" className="w-full sm:w-auto">
            <Button size="large" block style={{ borderColor: '#5B21B6', color: '#5B21B6', borderRadius: '8px', padding: '0 32px', height: '52px', fontWeight: 700, fontSize: '15px' }}>Lihat Kurikulum</Button>
          </Link>
        </div>
      </div>
      <div className="relative mt-12 md:mt-0">
        <div className="bg-[#1E1E1E] rounded-2xl p-6 shadow-2xl border border-gray-800 transform rotate-1 hover:rotate-0 transition duration-500">
           {/* Code Editor Mock */}
           <div className="flex gap-2 mb-6">
             <div className="w-3 h-3 rounded-full bg-red-500"></div>
             <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
             <div className="w-3 h-3 rounded-full bg-green-500"></div>
             <span className="ml-2 text-xs text-gray-500 font-mono flex items-center gap-2"><CodeOutlined/> Compiler - Ready</span>
           </div>
           <pre className="text-[13px] font-mono text-gray-300 leading-relaxed overflow-x-auto">
             <span className="text-purple-400">public class</span> <span className="text-yellow-200">Main</span> {"{\n"}
             {"  "}<span className="text-purple-400">public static void</span> <span className="text-blue-300">main</span>(String[] args) {"{\n"}
             {"    "}System.<span className="text-blue-300">out</span>.println(<span className="text-green-300">"Hello, BAJAPRO!"</span>);{"\n"}
             {"  }\n\n"}
             {"  "}<span className="text-gray-500">// Start your journey</span>{"\n"}
             {"  "}<span className="text-purple-400">boolean</span> startLearning = <span className="text-orange-400">true</span>;{"\n"}
             {"  "}<span className="text-purple-400">if</span> (startLearning) {"{\n"}
             {"    "}System.<span className="text-blue-300">out</span>.println(<span className="text-green-300">"Let's go!"</span>);{"\n"}
             {"  }\n"}
             {"}"}
           </pre>
        </div>
      </div>
    </div>
  </section>
);

const modules = [
  { id: 1, title: 'Module 1: Tipe Data, Variabel dan Operator', desc: 'Bangun fondasi pemrograman yang kuat dengan mempelajari tipe data, variabel, input-output, sequence, dan operator dalam Java.', icon: <CodeOutlined />, color: 'text-purple-600', bg: 'bg-purple-100', col: 'md:col-span-3' },
  { id: 2, title: 'Module 2: Sintaks Pemilihan', desc: 'Pelajari pengambilan keputusan dengan operator logika dan pemilihan bersarang.', icon: <ApartmentOutlined />, color: 'text-blue-600', bg: 'bg-blue-100', col: 'md:col-span-3' },
  { id: 3, title: 'Module 3: Sintaks Perulangan', desc: 'Pahami penggunaan perulangan untuk mengembangkan logika program yang lebih kompleks.', icon: <RetweetOutlined />, color: 'text-purple-600', bg: 'bg-purple-100', col: 'md:col-span-2' },
  { id: 4, title: 'Module 4: Array 1 & Multidimensi', desc: 'Pahami penggunaan array satu dimensi dan multidimensi untuk menyimpan serta mengakses data secara efisien.', icon: <AppstoreOutlined />, color: 'text-indigo-600', bg: 'bg-indigo-100', col: 'md:col-span-2' },
  { id: 5, title: 'Module 5: Fungsi', desc: 'Pelajari penggunaan fungsi statis dan fungsi rekursif untuk membuat program Java yang lebih terstruktur.', icon: <BulbOutlined />, color: 'text-purple-600', bg: 'bg-purple-100', col: 'md:col-span-2' },
]

const AlurBelajarSection = () => (
  <section id="materi" className="py-20 md:py-28 px-6 bg-white overflow-hidden">
    <div className="max-w-7xl mx-auto">
      <div className="mb-10 md:mb-14 max-w-2xl">
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3 md:mb-4">Alur Belajar Terstruktur</h2>
        <p className="text-gray-600 text-base md:text-lg">Kuasai dasar-dasar Java melalui materi pembelajaran yang terstruktur dan dirancang untuk membantu Anda membangun kemampuan pemrograman secara bertahap.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        {modules.map(mod => (
          <div key={mod.id} className={`${mod.col} bg-[#FAFAFA] border border-gray-100 p-8 rounded-[24px] hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
            <div className={`w-12 h-12 ${mod.bg} ${mod.color} rounded-xl flex items-center justify-center text-xl mb-6`}>
              {mod.icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{mod.title}</h3>
            <p className="text-gray-500 leading-relaxed text-sm font-medium">{mod.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const MetodePembelajaranSection = () => (
  <section id="aktivitas" className="py-20 md:py-24 px-6 bg-white overflow-hidden">
    <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 md:gap-20 items-center">
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3 md:mb-4">Metode Pembelajaran Variatif</h2>
        <p className="text-gray-600 text-base md:text-lg mb-8 md:mb-12">Dapatkan pengalaman belajar yang lebih interaktif melalui kombinasi materi teks, video, dan latihan.</p>
        
        <div className="space-y-10">
          {[
            { title: 'Video Pembelajaran', desc: 'Pelajari visual yang menarik untuk memecah algoritma kompleks langkah demi langkah.', icon: <PlayCircleFilled className="text-purple-600 text-3xl"/> },
            { title: 'Materi Teks', desc: 'Dokumentasi komprehensif dan mendetail untuk bacaan mendalam dan referensi cepat.', icon: <FileTextFilled className="text-yellow-500 text-3xl"/> },
            { title: 'Latihan Essay', desc: 'Uji pemahaman konseptual sebelum pengiriman final.', icon: <EditFilled className="text-green-500 text-3xl"/> },
            { title: 'Coding Test', desc: 'Latihan koding interaktif dengan compiler terintegrasi dan pesan error spesifik.', icon: <CodeFilled className="text-blue-500 text-3xl"/> },
          ].map((item, i) => (
            <div key={i} className="flex gap-6">
              <div className="mt-1">{item.icon}</div>
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h4>
                <p className="text-gray-500 text-sm font-medium leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="relative">
        <div className="bg-[#F8F7FA] p-8 md:p-12 rounded-[32px]">
           <div className="bg-[#1E1E1E] rounded-2xl shadow-2xl border border-gray-800 overflow-hidden">
             <div className="flex justify-between items-center px-5 py-4 bg-[#2D2D2D] border-b border-gray-700">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="text-xs text-gray-400 font-mono">Main.java</div>
             </div>
             <div className="p-6">
               <pre className="text-sm font-mono text-gray-300 leading-relaxed overflow-x-auto">
                 <span className="text-purple-400">public class</span> <span className="text-yellow-200">Main</span> {"{\n"}
                 {"  "}<span className="text-purple-400">public static void</span> <span className="text-blue-300">main</span>(String[] args) {"{\n"}
                 {"    "}System.<span className="text-blue-300">out</span>.println(<span className="text-green-300">"BAJAPRO Code Test!"</span>);{"\n"}
                 {"  }\n"}
                 {"}"}
               </pre>
               <div className="mt-8 pt-5 border-t border-gray-700">
                 <div className="text-xs text-gray-500 mb-2 font-mono">{"> Output: BAJAPRO Code Test!"}</div>
                 <div className="text-xs text-green-400 font-mono">BUILD SUCCESSFUL in 0.4s</div>
               </div>
             </div>
           </div>
        </div>
        
        {/* Floating element */}
        <div className="absolute -bottom-4 right-2 md:bottom-10 md:-left-12 bg-white p-3 md:p-5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 flex items-center gap-3 md:gap-5 z-10 animate-bounce" style={{ animationDuration: '3s' }}>
           <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-50 rounded-full flex items-center justify-center text-purple-600">
             <RobotOutlined className="text-xl md:text-2xl" />
           </div>
           <div>
             <div className="text-xs md:text-sm font-extrabold text-gray-900 mb-1">Fast Feedback</div>
             <div className="text-[10px] md:text-xs text-gray-500 font-medium">Real-time compilation</div>
           </div>
        </div>
      </div>
    </div>
  </section>
);

const SistemTerintegrasiSection = () => (
  <section className="py-20 md:py-28 px-6 overflow-hidden" style={{ background: 'linear-gradient(180deg, #FDF4FF 0%, #F9FAFB 100%)' }}>
    <div className="max-w-7xl mx-auto text-center">
      <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3 md:mb-4">Sistem Terintegrasi untuk Semua</h2>
      <p className="text-gray-600 text-base md:text-lg mb-10 md:mb-16 max-w-2xl mx-auto font-medium">Pengalaman yang dioptimalkan untuk setiap peran dalam ekosistem pembelajaran.</p>
      
      <div className="grid md:grid-cols-3 gap-8 text-left">
        {[
          { role: 'Siswa', icon: <UserOutlined/>, color: 'text-purple-600', bg: 'bg-purple-100', items: ['Pembelajaran interaktif dengan materi teks/video.', 'Latihan coding dengan feedback instan.', 'Pelacakan progres dan pencapaian gamifikasi.'] },
          { role: 'Pengajar', icon: <SolutionOutlined/>, color: 'text-blue-600', bg: 'bg-blue-100', items: ['Manajemen kelas dan penugasan yang efisien.', 'Otomatisasi penilaian tugas coding dasar.', 'Analitik performa siswa yang mendalam.'] },
          { role: 'Admin', icon: <SettingOutlined/>, color: 'text-purple-600', bg: 'bg-purple-100', items: ['Kontrol penuh atas pengguna dan akses sistem.', 'Manajemen kurikulum dan materi pembelajaran.', 'Pengaturan level, badge, dan sistem gamifikasi.'] },
        ].map((item, i) => (
          <div key={i} className="bg-white p-10 rounded-[24px] shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className={`w-14 h-14 ${item.bg} ${item.color} rounded-full flex items-center justify-center text-2xl mb-8`}>
              {item.icon}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">{item.role}</h3>
            <ul className="space-y-5">
              {item.items.map((desc, j) => (
                <li key={j} className="flex gap-4 text-[14px] text-gray-600 font-medium">
                  <CheckCircleFilled className="text-purple-300 text-lg mt-0.5" />
                  <span className="leading-relaxed">{desc}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-[#FAF8FD] text-gray-700 pt-16 md:pt-24 pb-8 md:pb-10 px-6 border-t border-purple-100 overflow-hidden">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-10 md:gap-12 mb-12 md:mb-20">
      <div className="md:col-span-2 md:pr-8">
        <Image
          src="/assets/logo/logo-completed.png"
          alt="Logo BAJAPRO"
          width={150}
          height={50}
          style={{ width: "auto", height: "24px", objectFit: "contain", marginBottom: "20px" }}
        />
        <p className="text-gray-500 text-sm leading-relaxed mb-6 font-medium">Platform e-course interaktif dengan compiler terintegrasi untuk mencetak developer masa depan.</p>
      </div>
      <div>
        <h4 className="font-bold mb-6 text-gray-900 text-base">Company</h4>
        <ul className="space-y-4 text-sm font-medium">
          <li><Link href="#" className="landing-nav-link">About Us</Link></li>
          <li><Link href="#" className="landing-nav-link">Blog</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold mb-6 text-gray-900 text-base">Resources</h4>
        <ul className="space-y-4 text-sm font-medium">
          <li><Link href="#" className="landing-nav-link">Java Documentation</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold mb-6 text-gray-900 text-base">Support</h4>
        <ul className="space-y-4 text-sm font-medium">
          <li><Link href="#" className="landing-nav-link">Help Center</Link></li>
          <li><Link href="#" className="landing-nav-link">Contact Us</Link></li>
          <li><Link href="#" className="landing-nav-link">Privacy Policy</Link></li>
        </ul>
      </div>
    </div>
    <div className="max-w-7xl mx-auto pt-8 border-t border-purple-100 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400 font-medium">
      <div>© 2026 BAJAPRO v2.1.1. All rights reserved.</div>
      <div className="flex gap-5 text-lg text-gray-400">
        <GlobalOutlined className="cursor-pointer hover:text-[#5B21B6] transition" />
        <ShareAltOutlined className="cursor-pointer hover:text-[#5B21B6] transition" />
      </div>
    </div>
  </footer>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      <Navbar />
      <HeroSection />
      <AlurBelajarSection />
      <MetodePembelajaranSection />
      <SistemTerintegrasiSection />
      <Footer />
    </div>
  );
}
