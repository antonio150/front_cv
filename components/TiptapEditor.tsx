"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
// import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";

import HardBreak from "@tiptap/extension-hard-break";
import { Node } from "@tiptap/core";


import { useEffect, useState } from "react";



// Extension personnalisée pour le HTML brut
const HtmlBlock = Node.create({
  name: "htmlBlock",
  group: "block",
  code: true,
  defining: true,
  isolating: true,
  content: "text*",

  parseHTML() {
    return [
      {
        tag: "div.html-block",
        preserveWhitespace: "full",
      },
    ];
  },

  renderHTML() {
    return ["div", { class: "html-block" }, 0];
  },
});

type Props = {
  content: string;
  setContent: (value: string) => void;
};

export default function TiptapEditor({ content, setContent }: Props) {
    const [htmlInput, setHtmlInput] = useState("");
    const [showHtmlModal, setShowHtmlModal] = useState(false);

    const editor = useEditor({
        extensions: [
        StarterKit,
        
        HtmlBlock,
        HardBreak,
        ],
        content,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
        setContent(editor.getHTML());
        },
    });
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

  if (!editor) return null;

  const insertHtml = () => {
    if (htmlInput.trim()) {
      // Insère directement le HTML dans l'éditeur
      editor.chain().focus().insertContent(htmlInput).run();
      setHtmlInput("");
      setShowHtmlModal(false);
    }
  };

  return (
    <div className="border rounded bg-white">
      {/* TOOLBAR */}
      <div className="flex gap-2 border-b p-2 bg-gray-50 flex-wrap">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className="px-2 py-1 border rounded hover:bg-gray-200"
        >
          B
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className="px-2 py-1 border rounded hover:bg-gray-200"
        >
          I
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className="px-2 py-1 border rounded hover:bg-gray-200"
        >
          H2
        </button>

      
      </div>

      {/* EDITOR */}
      <EditorContent
        editor={editor}
        className="p-3 min-h-[200px] prose prose-sm max-w-none"
      />

      
    </div>
  );
}
