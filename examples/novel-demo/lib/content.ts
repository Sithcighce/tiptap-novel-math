import { type JSONContent } from "novel";

export const defaultContent: JSONContent = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { level: 1 },
      content: [{ type: "text", text: "Tiptap Novel Math Extension" }],
    },
    {
      type: "paragraph",
      content: [
        { type: "text", text: "This is a demo for " },
        {
          type: "text",
          marks: [{ type: "bold" }, { type: "code" }],
          text: "tiptap-novel-math",
        },
        { type: "text", text: ", a powerful Tiptap extension that brings LaTeX mathematical equation editing to your React applications." },
      ],
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "📦 Installation" }],
    },
    {
      type: "codeBlock",
      attrs: { language: "bash" },
      content: [
        {
          type: "text",
          text: "npm install tiptap-novel-math katex",
        },
      ],
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "🚀 Usage" }],
    },
    {
      type: "paragraph",
      content: [
        { type: "text", text: "Simply add the " },
        { type: "text", marks: [{ type: "code" }], text: "Mathematics" },
        { type: "text", text: " extension to your Tiptap editor configuration:" },
      ],
    },
    {
      type: "codeBlock",
      attrs: { language: "typescript" },
      content: [
        {
          type: "text",
          text: 'import { EditorContent, useEditor } from "@tiptap/react";\nimport StarterKit from "@tiptap/starter-kit";\nimport { Mathematics } from "tiptap-novel-math";\nimport "katex/dist/katex.min.css";\n\nconst editor = useEditor({\n  extensions: [\n    StarterKit,\n    Mathematics.configure({\n      katexOptions: { throwOnError: false },\n    }),\n  ],\n});',
        },
      ],
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "✨ Interactive Examples" }],
    },
    {
      type: "paragraph",
      content: [
        { type: "text", text: "Try editing the equations below! Click on them to see the LaTeX source." },
      ],
    },
    {
      type: "heading",
      attrs: { level: 3 },
      content: [{ type: "text", text: "1. Inline Math" }],
    },
    {
      type: "paragraph",
      content: [
        { type: "text", text: "The mass-energy equivalence is described by the famous equation " },
        {
          type: "math",
          attrs: { latex: "E = mc^2" },
        },
        { type: "text", text: ". This extension handles inline math seamlessly within your text paragraphs." },
      ],
    },
    {
      type: "heading",
      attrs: { level: 3 },
      content: [{ type: "text", text: "2. Block Math" }],
    },
    {
      type: "paragraph",
      content: [
        { type: "text", text: "For more complex equations, you can use block display mode:" },
      ],
    },
    {
      type: "math",
      attrs: { latex: "\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}", displayMode: true },
    },
    {
      type: "paragraph",
      content: [
        { type: "text", text: "Or the quadratic formula:" },
      ],
    },
    {
      type: "math",
      attrs: { latex: "x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}", displayMode: true },
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "⌨️ Auto-Completion" }],
    },
    {
      type: "paragraph",
      content: [
        { type: "text", text: "You can also type LaTeX directly! Try typing " },
        { type: "text", marks: [{ type: "code" }], text: "$x^2$" },
        { type: "text", text: " or " },
        { type: "text", marks: [{ type: "code" }], text: "$$ \\sum_{i=1}^n i $$" },
        { type: "text", text: " into the editor to verify auto-conversion." },
      ],
    },
    {
      type: "horizontalRule",
    },
    {
      type: "paragraph",
      content: [
        { type: "text", text: "Check out the " },
        {
          type: "text",
          marks: [
            {
              type: "link",
              attrs: {
                href: "https://github.com/Sithcighce/tiptap-novel-math",
                target: "_blank",
              },
            },
          ],
          text: "GitHub repository",
        },
        { type: "text", text: " for more details and documentation." },
      ],
    },
  ],
};