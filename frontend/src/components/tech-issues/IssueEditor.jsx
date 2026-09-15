import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight } from "lowlight";
import javascript from "highlight.js/lib/languages/javascript";

// ✅ create lowlight instance correctly
const lowlight = createLowlight();
lowlight.register("javascript", javascript);

export default function IssueEditor({ onSubmit }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content: "<p>Describe your issue clearly...</p>",
  });

  if (!editor) return null;

  return (
    <div className="border border-white/10 rounded-xl bg-white/5 p-6 mb-10">
      <h3 className="text-sm tracking-widest mb-4">
        Create New Issue
      </h3>

      <div className="border border-white/10 rounded-lg p-4 mb-4 bg-black/40">
        <EditorContent editor={editor} />
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => onSubmit(editor.getHTML())}
          className="px-5 py-2 bg-white text-black text-sm rounded hover:bg-gray-200 transition"
        >
          Post Issue
        </button>
      </div>
    </div>
  );
}