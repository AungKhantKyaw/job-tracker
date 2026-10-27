"use client";

import { useEffect, useRef } from "react";
import { type ReactNode } from "react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import styles from "./RichTextEditor.module.css";

interface RichTextEditorProps {
  /** HTML string (or legacy plain text) */
  value: string;
  /** Called with the new HTML ("" when the editor is empty) */
  onChange: (html: string) => void;
  minHeight?: number;
}

const HTML_TAG = /<\/?[a-z][\s\S]*>/i;

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

interface BtnProps {
  label: ReactNode;
  title: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

function Btn({ label, title, active, disabled, onClick }: BtnProps) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`${styles.btn} ${active ? styles.btnActive : ""}`}
    >
      {label}
    </button>
  );
}

/**
 * Old records may hold plain text with line breaks instead of HTML.
 * Turn those into paragraphs so the line breaks are not lost.
 */
const toEditorHtml = (value: string) => {
  if (!value) return "";
  if (HTML_TAG.test(value)) return value;
  return value
    .split(/\n{2,}/)
    .map((para) => `<p>${escapeHtml(para).replace(/\n/g, "<br>")}</p>`)
    .join("");
};

export default function RichTextEditor({
  value,
  onChange,
  minHeight = 160,
}: RichTextEditorProps) {
  // Last HTML this editor reported, so we don't reset the editor
  // (and the cursor) in response to our own changes.
  const lastEmitted = useRef<string>(value);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: {
            rel: "noopener noreferrer nofollow",
            target: "_blank",
          },
        },
      }),
    ],
    content: toEditorHtml(value),
    // Avoids a server/client hydration mismatch in Next.js
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.isEmpty ? "" : editor.getHTML();
      lastEmitted.current = html;
      onChange(html);
    },
  });

  // The edit page loads the job asynchronously, so the value arrives after
  // the editor has been created. Load it when it changes from outside.
  useEffect(() => {
    if (!editor) return;
    if (value === lastEmitted.current) return;
    lastEmitted.current = value;
    editor.commands.setContent(toEditorHtml(value), { emitUpdate: false });
  }, [value, editor]);

  const state = useEditorState({
    editor,
    selector: ({ editor }) =>
      editor
        ? {
            bold: editor.isActive("bold"),
            italic: editor.isActive("italic"),
            underline: editor.isActive("underline"),
            h2: editor.isActive("heading", { level: 2 }),
            h3: editor.isActive("heading", { level: 3 }),
            bullet: editor.isActive("bulletList"),
            ordered: editor.isActive("orderedList"),
            link: editor.isActive("link"),
            canUndo: editor.can().undo(),
            canRedo: editor.can().redo(),
          }
        : null,
  });

  if (!editor) {
    return (
      <div
        className={styles.wrapper}
        style={{ minHeight: minHeight + 44 }}
        aria-busy="true"
      />
    );
  }

  const setLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const input = window.prompt("Link URL (leave empty to remove)", previous);
    if (input === null) return; // cancelled
    const url = input.trim();
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    const href = /^[a-z][a-z0-9+.-]*:/i.test(url) ? url : `https://${url}`;
    editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <Btn
          label={<strong>B</strong>}
          title="Bold"
          active={state?.bold}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <Btn
          label={<em>I</em>}
          title="Italic"
          active={state?.italic}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <Btn
          label={<u>U</u>}
          title="Underline"
          active={state?.underline}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        />
        <span className={styles.divider} />
        <Btn
          label="H2"
          title="Heading"
          active={state?.h2}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        />
        <Btn
          label="H3"
          title="Subheading"
          active={state?.h3}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        />
        <span className={styles.divider} />
        <Btn
          label="• List"
          title="Bullet list"
          active={state?.bullet}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <Btn
          label="1. List"
          title="Numbered list"
          active={state?.ordered}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <span className={styles.divider} />
        <Btn label="Link" title="Add or edit link" active={state?.link} onClick={setLink} />
        <Btn
          label="Clear"
          title="Clear formatting"
          onClick={() =>
            editor.chain().focus().clearNodes().unsetAllMarks().run()
          }
        />
        <span className={styles.divider} />
        <Btn
          label="↶"
          title="Undo"
          disabled={!state?.canUndo}
          onClick={() => editor.chain().focus().undo().run()}
        />
        <Btn
          label="↷"
          title="Redo"
          disabled={!state?.canRedo}
          onClick={() => editor.chain().focus().redo().run()}
        />
      </div>
      <div
        className={styles.content}
        style={{ ["--editor-min-height" as string]: `${minHeight}px` }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
