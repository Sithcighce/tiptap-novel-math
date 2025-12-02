# tiptap-novel-math

[English](./README.md) | [简体中文](./README_zh-CN.md)

[![CI](https://github.com/Sithcighce/tiptap-novel-math/actions/workflows/ci.yml/badge.svg)](https://github.com/Sithcighce/tiptap-novel-math/actions/workflows/ci.yml)
[![NPM Version](https://img.shields.io/npm/v/tiptap-novel-math?color=blue)](https://www.npmjs.com/package/tiptap-novel-math)
[![License](https://img.shields.io/github/license/Sithcighce/tiptap-novel-math)](./LICENSE)

一个适用于 [Tiptap](https://tiptap.dev) 和 [Novel](https://novel.sh) 的 Notion 风格交互式数学公式扩展。

本扩展为 LaTeX 数学公式提供了无缝的“点击即编辑”体验，支持行内 (`$E=mc^2$`) 和块级 (`$$...$$`) 公式。

## ✨ 特性

- 🖱️ **交互式编辑**：点击任意公式即可打开带有实时预览的弹出编辑器。
- ⌨️ **输入规则 (Input Rules)**：
  - 输入 `$$` + `Space` 插入块级公式。
  - 输入 `$E=mc^2$` 自动转换为行内公式。
- 📋 **智能粘贴**：自动检测粘贴文本中的 LaTeX 模式并转换为数学节点。
- 🔄 **块/行内切换**：轻松切换显示模式。
- 🎨 **零样式绑定**：使用标准的 Tailwind 类和无样式原语 (Radix UI)，最大程度支持自定义。

## 📦 安装

```bash
npm install tiptap-novel-math katex
# Peer dependencies (通常项目中已有)
npm install @tiptap/core @tiptap/react react react-dom
```

## 🎨 样式引入

您需要在项目的根入口（例如 `layout.tsx` 或 `App.tsx`）引入 KaTeX 的 CSS：

```css
import "katex/dist/katex.min.css";
```

## 🚀 使用方法

将扩展添加到您的 Tiptap 编辑器配置中：

```tsx
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Mathematics, MarkdownLatexParser } from "tiptap-novel-math";
import "katex/dist/katex.min.css";

const Editor = () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Mathematics, // 核心扩展
      MarkdownLatexParser, // 可选：增强的粘贴支持
    ],
    content: "<p>输入 $E=mc^2$ 见证奇迹！</p>",
  });

  return <EditorContent editor={editor} />;
};
```

## 🔧 工具栏按钮示例

您可以轻松添加一个按钮来切换数学模式：

```tsx
const MathButton = ({ editor }) => {
  if (!editor) return null;

  return (
    <button
      onClick={() => {
        const { from, to } = editor.state.selection;
        const latex = editor.state.doc.textBetween(from, to);
        
        if (!editor.isActive("math")) {
            editor.chain().focus().setLatex({ latex }).run();
        } else {
            editor.chain().focus().unsetLatex().run();
        }
      }}
    >
      ∑ 插入公式
    </button>
  );
};
```

## 🤝 贡献

欢迎提交 Pull Requests！请查看 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解更多信息。

## 📄 许可证

MIT
