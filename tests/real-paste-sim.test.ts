/**
 * 模拟真实浏览器粘贴行为
 */
import { describe, it, expect } from "vitest";
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import { Mathematics, MarkdownLatexParser } from "../src/index";

describe("Real Paste Simulation", () => {
  // 跳过：ClipboardEvent 在 Node.js 环境中不存在，需要真实浏览器测试
  it.skip("should simulate paste with slice", () => {
    const editor = new Editor({
      extensions: [
        StarterKit,
        Mathematics,
        MarkdownLatexParser,
        Markdown.configure({
          html: true,
          transformPastedText: true,
          transformCopiedText: true,
        }),
      ],
      content: "<p></p>",
    });

    const formula = `$$
\\begin{align}
 \\text{field condition:}& \\begin{cases}
\\text{far field: } & \\vec{r}\\gg \\frac{c}{\\omega } \\\\
\\text{medium field:} & \\vec{r} \\sim \\frac{c}{\\omega} \\\\
\\text{near field:} & \\vec{r} \\ll \\frac{c}{\\omega}
\\end{cases} \\\\

  \\text{far field approximation:} & \\begin{cases}
\\frac{1}{|\\vec{r}-\\vec{\\xi}|} & = \\frac{1}{|\\vec{r}|}\\\\
\\frac{\\omega}{c}|\\vec{r}-\\vec{\\xi} | & = \\frac{\\omega}{c}
\\end{cases}
\\end{align}
$$`;

    // 使用 pasteText 命令 - 这更接近真实粘贴
    editor.commands.focus();
    
    // tiptap-markdown 有 transformPastedText，粘贴时会调用 clipboardTextParser
    // 我们用 view.pasteText 来模拟
    // @ts-ignore
    if (editor.view.pasteText) {
      // @ts-ignore
      editor.view.pasteText(formula);
    } else {
      // 回退到 insertContent
      editor.commands.insertContent(formula);
    }

    const json = editor.getJSON();
    console.log("=== Paste simulation ===");
    console.log("Content:", JSON.stringify(json).substring(0, 500));
    
    editor.destroy();
  });

  it("should check if markdown transformPastedText works", () => {
    const editor = new Editor({
      extensions: [
        StarterKit,
        Mathematics,
        MarkdownLatexParser,
        Markdown.configure({
          html: true,
          transformPastedText: true,
          transformCopiedText: true,
        }),
      ],
      content: "<p></p>",
    });

    // 检查 markdown 扩展的配置
    const mdExt = editor.extensionManager.extensions.find(e => e.name === "markdown");
    console.log("=== Markdown extension config ===");
    console.log("Found:", !!mdExt);
    // @ts-ignore
    console.log("Options:", mdExt?.options);
    
    editor.destroy();
  });
});
