"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import HardBreak from "@tiptap/extension-hard-break";

import { useEffect } from "react";

type Props = {
  content: string;
  setContent: (value: string) => void;
};

export default function TiptapEditor({ content, setContent }: Props) {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Bold,
      Italic,
      HardBreak,
    ],
    content,
    immediatelyRender: false,

    editorProps: {
      handlePaste(view, event) {
        event.preventDefault();

        const text = event.clipboardData?.getData("text/plain");

        if (text) {
          view.dispatch(
            view.state.tr.insertText(text)
          );
        }

        return true;
      },
    },

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

  return (
    <div className="border rounded bg-white">
      <div className="flex gap-2 border-b p-2 bg-gray-50">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className="px-2 py-1 border rounded"
        >
          B
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className="px-2 py-1 border rounded"
        >
          I
        </button>
      </div>

      <EditorContent
        editor={editor}
        className="p-3 min-h-[200px]"
      />
    </div>
  );
}
