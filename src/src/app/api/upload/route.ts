import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import fs from "fs";

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Tidak ada file yang diunggah" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Gunakan timestamp dan random string untuk nama file unik
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const originalExt = path.extname(file.name);
    const filename = `${uniqueSuffix}${originalExt}`;

    // Path ke folder public/uploads
    let uploadDir = path.join(process.cwd(), "public", "uploads");
    let publicUrl = `/uploads/${filename}`;
    
    if (type === "course") {
      uploadDir = path.join(process.cwd(), "public", "uploads", "courses");
      publicUrl = `/uploads/courses/${filename}`;
    }

    // Pastikan folder uploads ada
    if (!fs.existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const filepath = path.join(uploadDir, filename);

    // Tulis file ke folder
    await writeFile(filepath, buffer);

    return NextResponse.json({ url: publicUrl, filename: filename, success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "Gagal mengunggah file" }, { status: 500 });
  }
}
