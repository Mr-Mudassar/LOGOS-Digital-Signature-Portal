'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import FontFamily from '@tiptap/extension-font-family'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Type,
} from 'lucide-react'
import { useState } from 'react'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  editable?: boolean
}

export default function RichTextEditor({
  content,
  onChange,
  editable = true,
}: RichTextEditorProps) {
  const [showFontSize, setShowFontSize] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextStyle,
      Color,
      FontFamily,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: content,
    editable: editable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  if (!editor) {
    return null
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {editable && (
        <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-1 items-center">
          {/* Text Style Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowFontSize(!showFontSize)}
              className="px-3 py-2 rounded hover:bg-gray-200 text-sm flex items-center gap-2 min-w-[120px] justify-between"
              type="button"
            >
              <Type className="w-4 h-4" />
              <span>
                {editor.isActive('heading', { level: 1 })
                  ? 'Heading 1'
                  : editor.isActive('heading', { level: 2 })
                  ? 'Heading 2'
                  : editor.isActive('heading', { level: 3 })
                  ? 'Heading 3'
                  : 'Normal'}
              </span>
            </button>
            {showFontSize && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 min-w-[120px]">
                <button
                  onClick={() => {
                    editor.chain().focus().setParagraph().run()
                    setShowFontSize(false)
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                    !editor.isActive('heading') ? 'bg-gray-50 font-semibold' : ''
                  }`}
                  type="button"
                >
                  Normal
                </button>
                <button
                  onClick={() => {
                    editor.chain().focus().toggleHeading({ level: 1 }).run()
                    setShowFontSize(false)
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-100 text-2xl font-bold ${
                    editor.isActive('heading', { level: 1 }) ? 'bg-gray-50' : ''
                  }`}
                  type="button"
                >
                  Heading 1
                </button>
                <button
                  onClick={() => {
                    editor.chain().focus().toggleHeading({ level: 2 }).run()
                    setShowFontSize(false)
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-100 text-xl font-bold ${
                    editor.isActive('heading', { level: 2 }) ? 'bg-gray-50' : ''
                  }`}
                  type="button"
                >
                  Heading 2
                </button>
                <button
                  onClick={() => {
                    editor.chain().focus().toggleHeading({ level: 3 }).run()
                    setShowFontSize(false)
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-100 text-lg font-bold ${
                    editor.isActive('heading', { level: 3 }) ? 'bg-gray-50' : ''
                  }`}
                  type="button"
                >
                  Heading 3
                </button>
              </div>
            )}
          </div>

          <div className="w-px bg-gray-300 mx-1"></div>

          {/* Text Formatting */}
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-gray-200 ${
              editor.isActive('bold') ? 'bg-gray-300' : ''
            }`}
            type="button"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-gray-200 ${
              editor.isActive('italic') ? 'bg-gray-300' : ''
            }`}
            type="button"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded hover:bg-gray-200 ${
              editor.isActive('underline') ? 'bg-gray-300' : ''
            }`}
            type="button"
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>

          <div className="w-px bg-gray-300 mx-1"></div>

          {/* Lists */}
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-gray-200 ${
              editor.isActive('bulletList') ? 'bg-gray-300' : ''
            }`}
            type="button"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-gray-200 ${
              editor.isActive('orderedList') ? 'bg-gray-300' : ''
            }`}
            type="button"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <div className="w-px bg-gray-300 mx-1"></div>

          {/* Text Alignment */}
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-2 rounded hover:bg-gray-200 ${
              editor.isActive({ textAlign: 'left' }) ? 'bg-gray-300' : ''
            }`}
            type="button"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-2 rounded hover:bg-gray-200 ${
              editor.isActive({ textAlign: 'center' }) ? 'bg-gray-300' : ''
            }`}
            type="button"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-2 rounded hover:bg-gray-200 ${
              editor.isActive({ textAlign: 'right' }) ? 'bg-gray-300' : ''
            }`}
            type="button"
          >
            <AlignRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={`p-2 rounded hover:bg-gray-200 ${
              editor.isActive({ textAlign: 'justify' }) ? 'bg-gray-300' : ''
            }`}
            type="button"
          >
            <AlignJustify className="w-4 h-4" />
          </button>
        </div>
      )}
      <EditorContent
        editor={editor}
        className={`p-4 ${editable ? 'min-h-[400px]' : ''} focus:outline-none`}
      />
      <style jsx global>{`
        .ProseMirror {
          outline: none;
        }
        .ProseMirror h1 {
          font-size: 2em;
          font-weight: bold;
          margin-top: 0.67em;
          margin-bottom: 0.67em;
          line-height: 1.2;
        }
        .ProseMirror h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin-top: 0.75em;
          margin-bottom: 0.75em;
          line-height: 1.3;
        }
        .ProseMirror h3 {
          font-size: 1.17em;
          font-weight: bold;
          margin-top: 0.83em;
          margin-bottom: 0.83em;
          line-height: 1.4;
        }
        .ProseMirror p {
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }
        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 1.5em;
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }
        .ProseMirror ul {
          list-style-type: disc;
        }
        .ProseMirror ol {
          list-style-type: decimal;
        }
        .ProseMirror li {
          margin-top: 0.25em;
          margin-bottom: 0.25em;
        }
        .ProseMirror strong {
          font-weight: bold;
        }
        .ProseMirror em {
          font-style: italic;
        }
        .ProseMirror u {
          text-decoration: underline;
        }
      `}</style>
    </div>
  )
}
