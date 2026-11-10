"use client";

import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

function toEditorHtml(value: string) {
  const v = (value || "").trim();
  if (!v) return "";
  if (/<[a-z][\s\S]*>/i.test(v)) return v;
  return v
    .split(/\n{2,}/)
    .map((block) => `<p>${block.replace(/\n/g, "<br>")}</p>`)
    .join("");
}

type Props = {
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
  placeholder?: string;
};

export function RichTextEditor({
  value,
  onChange,
  disabled,
  placeholder = "Write product content…",
}: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
      Underline,
      Highlight.configure({ multicolor: false }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { class: "text-[#7eb6ff] underline" },
      }),
      Image.configure({
        HTMLAttributes: { class: "max-w-full rounded-md" },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
    ],
    content: toEditorHtml(value),
    editorProps: {
      attributes: {
        class:
          "min-h-[220px] max-h-[420px] overflow-y-auto px-3 py-2.5 text-[13px] leading-6 text-slate-200 outline-none focus:outline-none [&_h2]:mb-2 [&_h2]:mt-3 [&_h2]:text-[18px] [&_h2]:font-semibold [&_h3]:mb-1.5 [&_h3]:mt-2.5 [&_h3]:text-[15px] [&_h3]:font-semibold [&_h4]:mb-1 [&_h4]:mt-2 [&_h4]:text-[14px] [&_h4]:font-semibold [&_p]:mb-2 [&_ul]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-2 [&_blockquote]:border-[#2f7bff]/50 [&_blockquote]:pl-3 [&_blockquote]:text-slate-400 [&_a]:text-[#7eb6ff] [&_a]:underline [&_hr]:my-3 [&_hr]:border-white/10",
      },
    },
    onUpdate: ({ editor: ed }) => {
      const html = ed.isEmpty ? "" : ed.getHTML();
      onChange(html);
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [editor, disabled]);

  if (!editor) {
    return (
      <div className="mt-1 min-h-[260px] rounded-md border border-white/[0.08] bg-[#0b0f14] px-3 py-2.5 text-[12px] text-slate-500">
        Loading editor…
      </div>
    );
  }

  function setLink() {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", prev || "https://");
    if (url === null) return;
    if (!url.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }

  function setImage() {
    if (!editor) return;
    const url = window.prompt("Image URL", "https://");
    if (!url?.trim()) return;
    editor.chain().focus().setImage({ src: url.trim() }).run();
  }

  return (
    <div className="mt-1 overflow-hidden rounded-md border border-white/[0.08] bg-[#0b0f14]">
      <div className="flex flex-wrap gap-1 border-b border-white/[0.06] bg-[#0f1520] p-1.5">
        <ToolBtn active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} label="B" title="Bold" className="font-bold" />
        <ToolBtn active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} label="I" title="Italic" className="italic" />
        <ToolBtn active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} label="U" title="Underline" className="underline" />
        <ToolBtn active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()} label="S" title="Strike" className="line-through" />
        <Sep />
        <ToolBtn active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} label="H2" title="Heading 2" />
        <ToolBtn active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} label="H3" title="Heading 3" />
        <ToolBtn active={editor.isActive("heading", { level: 4 })} onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} label="H4" title="Heading 4" />
        <Sep />
        <ToolBtn active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} label="• List" title="Bullet list" />
        <ToolBtn active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} label="1. List" title="Numbered list" />
        <ToolBtn active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} label="Quote" title="Quote" />
        <ToolBtn active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()} label="Code" title="Code block" />
        <Sep />
        <ToolBtn active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()} label="⟸" title="Align left" />
        <ToolBtn active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()} label="⇔" title="Align center" />
        <ToolBtn active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()} label="⟹" title="Align right" />
        <Sep />
        <ToolBtn active={editor.isActive("highlight")} onClick={() => editor.chain().focus().toggleHighlight().run()} label="HL" title="Highlight" />
        <ToolBtn active={editor.isActive("link")} onClick={setLink} label="Link" title="Insert link" />
        <ToolBtn onClick={setImage} label="Img" title="Insert image" />
        <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} label="—" title="Divider" />
        <Sep />
        <ToolBtn onClick={() => editor.chain().focus().undo().run()} label="Undo" title="Undo" />
        <ToolBtn onClick={() => editor.chain().focus().redo().run()} label="Redo" title="Redo" />
        <ToolBtn
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          label="Clear"
          title="Clear formatting"
        />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

function Sep() {
  return <span className="mx-0.5 w-px self-stretch bg-white/10" />;
}

function ToolBtn({
  label,
  title,
  onClick,
  active,
  className = "",
}: {
  label: string;
  title: string;
  onClick: () => void;
  active?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`rounded px-2 py-1 text-[11px] font-medium ${
        active
          ? "bg-[#2f7bff]/25 text-[#9ec5ff]"
          : "text-slate-400 hover:bg-white/[0.06] hover:text-slate-200"
      } ${className}`}
    >
      {label}
    </button>
  );
}
