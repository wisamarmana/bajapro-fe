"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import { Underline } from "@tiptap/extension-underline";
import { Link } from "@tiptap/extension-link";
import { Image } from "@tiptap/extension-image";
import { TextAlign } from "@tiptap/extension-text-align";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { Placeholder } from "@tiptap/extension-placeholder";
import { common, createLowlight } from "lowlight";
import java from "highlight.js/lib/languages/java";
import React, { useEffect, useRef } from "react";

// Ant Design Icons - Sudah diperbaiki namanya
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  StrikethroughOutlined,
  CodeOutlined,
  UnorderedListOutlined,
  OrderedListOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  LinkOutlined,
  FileImageOutlined,
  UndoOutlined,
  RedoOutlined,
  TableOutlined,
} from "@ant-design/icons";

// Registrasi bahasa Java
const lowlight = createLowlight(common);
lowlight.register("java", java);

// --- TYPE DEFINITIONS (Menghilangkan error ESLint any) ---
interface EditorProps {
  value: string;
  onChange?: (content: string) => void;
}

interface BtnProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title?: string;
}

// --- SUB-COMPONENTS ---
const Group = ({ children }: { children: React.ReactNode }) => (
  <div className="flex gap-0.5 px-1.5 border-r border-[#d9d9d9] last:border-0 items-center">
    {children}
  </div>
);

const Btn = ({ onClick, active, disabled, children, title }: BtnProps) => (
  <button
    type="button"
    title={title}
    disabled={disabled}
    onClick={(e) => {
      e.preventDefault();
      onClick();
    }}
    className={`p-1.5 min-w-[30px] flex items-center justify-center rounded transition-all text-sm ${
      active
        ? "bg-[#e6f4ff] text-[#1677ff] border-[#91caff] border"
        : "bg-transparent text-[#595959] hover:bg-[#0000000a] border border-transparent"
    } ${disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
  >
    {children}
  </button>
);

// --- MAIN EDITOR COMPONENT ---
export default function TiptapEditor({ value, onChange }: EditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ 
        codeBlock: false, // Dimatikan karena pakai Lowlight
      }),
      Underline,
      Link.configure({ 
        openOnClick: false,
        HTMLAttributes: { class: "text-blue-500 underline cursor-pointer" } 
      }),
      Image.configure({ allowBase64: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      CodeBlockLowlight.configure({ 
        lowlight, 
        defaultLanguage: "java" 
      }),
      Placeholder.configure({ 
        placeholder: "Ketik materi di sini atau masukkan blok kode Java..." 
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    immediatelyRender: false,
  });

  
  useEffect(() => {
    if (!editor) return;
    const currentHTML = editor.getHTML();
    if (value !== currentHTML) {
      // `setContent` dengan emitUpdate: false agar tidak trigger onUpdate/onChange
      editor.commands.setContent(value ?? "", { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) return null;

  // Handlers
  const addImage = () => {
    // Trigger file input click instead of URL prompt
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/gif" || file.type === "image/webp";
    if (!isJpgOrPng) {
      alert("Hanya bisa upload file gambar (JPG, PNG, GIF, WebP)!");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size / 1024 / 1024 > 5) {
      alert("Ukuran gambar maksimal 5MB!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload?type=material", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        editor.chain().focus().setImage({ src: data.url }).run();
      } else {
        alert("Gagal mengunggah gambar.");
      }
    } catch {
      alert("Terjadi kesalahan saat mengunggah gambar.");
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Masukkan URL Link:", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="tiptap-container border border-[#d9d9d9] rounded-md overflow-hidden bg-white hover:border-[#4096ff] transition-colors">
      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        style={{ display: "none" }}
        onChange={handleImageUpload}
      />

      {/* TOOLBAR - STICKY like Microsoft Word */}
      <div className="flex flex-wrap items-center gap-y-1 p-1 bg-[#fafafa] border-b border-[#d9d9d9]" style={{ position: "sticky", top: 0, zIndex: 50 }}>
        <Group>
          <Btn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo"><UndoOutlined /></Btn>
          <Btn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo"><RedoOutlined /></Btn>
        </Group>

        <Group>
          <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })}>H1</Btn>
          <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })}>H2</Btn>
        </Group>

        <Group>
          <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}><BoldOutlined /></Btn>
          <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}><ItalicOutlined /></Btn>
          <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")}><UnderlineOutlined /></Btn>
          <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")}><StrikethroughOutlined /></Btn>
        </Group>

        <Group>
          <Btn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })}><AlignLeftOutlined /></Btn>
          <Btn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })}><AlignCenterOutlined /></Btn>
          <Btn onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })}><AlignRightOutlined /></Btn>
        </Group>

        <Group>
          <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}><UnorderedListOutlined /></Btn>
          <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}><OrderedListOutlined /></Btn>
        </Group>

        <Group>
          <Btn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Java Code Block">
            <CodeOutlined /> <span className="ml-1 text-[10px] font-bold">JAVA</span>
          </Btn>
          <Btn onClick={setLink} active={editor.isActive("link")} title="Insert Link"><LinkOutlined /></Btn>
          <Btn onClick={addImage} title="Upload Gambar"><FileImageOutlined /></Btn>
          <Btn onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} title="Insert Table"><TableOutlined /></Btn>
        </Group>
      </div>

      {/* EDITOR CONTENT - scrollable */}
      <div className="p-4 bg-white" style={{ maxHeight: "600px", overflowY: "auto" }}>
        <EditorContent editor={editor} className="tiptap-content-area" />
      </div>

      {/* CUSTOM CSS */}
      <style>{`
        .tiptap-content-area .ProseMirror {
          min-height: 300px;
          outline: none;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 15px;
          line-height: 1.6;
        }
        .tiptap-content-area .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #bfbfbf;
          pointer-events: none;
          height: 0;
        }
        .tiptap-content-area h1 { font-size: 2em; font-weight: bold; margin: 0.5rem 0; }
        .tiptap-content-area h2 { font-size: 1.5em; font-weight: bold; margin: 0.5rem 0; border-bottom: 1px solid #f0f0f0; }
        .tiptap-content-area ul { list-style-type: disc; padding-left: 1.5rem; }
        .tiptap-content-area ol { list-style-type: decimal; padding-left: 1.5rem; }
        .tiptap-content-area img { max-width: 100%; height: auto; border-radius: 4px; margin: 1rem 0; }
        
        /* Table Styling */
        .tiptap-content-area table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
        .tiptap-content-area th, .tiptap-content-area td { border: 1px solid #d9d9d9; padding: 8px 12px; }
        .tiptap-content-area th { background: #fafafa; font-weight: 600; }

        /* Java Code Highlight */
        .tiptap-content-area pre { 
          background: #282c34; 
          color: #abb2bf; 
          padding: 1rem; 
          border-radius: 6px; 
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
          margin: 1rem 0;
          overflow-x: auto;
        }
        .hljs-keyword { color: #c678dd; font-weight: bold; }
        .hljs-title { color: #61afef; }
        .hljs-string { color: #98c379; }
        .hljs-comment { color: #5c6370; font-style: italic; }
        .hljs-number { color: #d19a66; }
      `}</style>
    </div>
  );
}