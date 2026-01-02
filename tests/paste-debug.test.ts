/**
 * 粘贴调试测试 - 检查多行块公式粘贴
 */
import { describe, it, expect, afterEach } from "vitest";
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import { Mathematics, MarkdownLatexParser } from "../src/index";

describe("Paste Debug", () => {
  let editor: Editor;

  const findAllMathNodes = (node: any): any[] => {
    const results: any[] = [];
    if (node.type === "math") {
      results.push(node);
    }
    if (node.content) {
      for (const child of node.content) {
        results.push(...findAllMathNodes(child));
      }
    }
    return results;
  };

  afterEach(() => {
    if (editor) editor.destroy();
  });

  it("should handle pasted multi-line $$...$$ with aligned", () => {
    editor = new Editor({
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

    // 模拟用户粘贴的确切内容
    const pastedText = `$$
\\begin{aligned}
\\mathcal{R}_{momentum} &= \\rho (\\mathbf{u} \\cdot \\nabla)\\mathbf{u} - \\nabla \\cdot \\sigma(\\mathbf{u}, p) + \\alpha(\\gamma)\\mathbf{u} \\\\
\\mathcal{R}_{continuity} &= \\nabla \\cdot \\mathbf{u} \\\\
\\mathcal{R}_{energy} &= \\rho C_p (\\mathbf{u} \\cdot \\nabla T) - \\nabla \\cdot (k(\\gamma) \\nabla T) - Q
\\end{aligned}
$$`;

    console.log("=== Pasting text ===");
    console.log(pastedText);
    console.log("===================");

    // 模拟粘贴
    editor.view.dispatch(
      editor.state.tr
        .insertText(pastedText)
        .setMeta("paste", true)
    );

    console.log("=== After paste ===");
    const json = editor.getJSON();
    console.log("JSON:", JSON.stringify(json, null, 2));

    const mathNodes = findAllMathNodes(json);
    console.log("Found math nodes:", mathNodes.length);
    mathNodes.forEach((node, i) => {
      console.log(`Math ${i+1}:`, {
        displayMode: node.attrs.displayMode,
        latex: node.attrs.latex?.substring(0, 50) + "..."
      });
    });

    // 应该只有 1 个块公式
    expect(mathNodes.length).toBe(1);
    expect(mathNodes[0].attrs.displayMode).toBe(true);
  });
});
