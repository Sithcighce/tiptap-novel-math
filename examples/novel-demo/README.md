# Tiptap Novel Math Demo

This is a live demonstration of the [tiptap-novel-math](https://github.com/Sithcighce/tiptap-novel-math) extension integrated into a [Novel](https://novel.sh)-based editor.

It showcases a pure frontend implementation with no server-side dependencies.

## ✨ Features

- **Rich Text & Math**: Seamlessly mix Markdown formatting with LaTeX equations.
- **Interactive Math**: Click on any equation to edit it with a live preview.
- **Auto-conversion**: Type `$E=mc^2$` or paste LaTeX code to instantly render math.
- **Pure Frontend**: Images are previewed locally using `URL.createObjectURL`, and no data is sent to any server.

## 🚀 Running Locally

This project is configured as a workspace of the main repository.

1. **Install dependencies** (from the project root):
   ```bash
   npm install
   ```

2. **Start the demo**:
   ```bash
   npm run dev -w novel-demo
   # or cd into this directory and run npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000).

## 📦 Tech Stack

- **Novel** (Tiptap-based editor)
- **tiptap-novel-math** (Local extension source)
- **KaTeX**
- **Next.js 15**
- **Tailwind CSS**

For more details on how to use the library, please refer to the [main README](../../README.md).