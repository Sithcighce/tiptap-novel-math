/**
 * 测试 transformPastedText 对多行块公式的影响
 */
import { describe, it, expect, afterEach } from "vitest";
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import { Mathematics, MarkdownLatexParser } from "../src/index";

describe("Paste with transformPastedText", () => {
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

  it("DEBUG: 测试 transformPastedText 如何处理多行公式", () => {
    // 模拟前端的配置
    editor = new Editor({
      extensions: [
        StarterKit,
        Mathematics,
        // MarkdownLatexParser,  // 前端注释掉了这个
        Markdown.configure({
          html: true,
          tightLists: true,
          tightListClass: "tight",
          bulletListMarker: "-",
          linkify: false,
          breaks: false,
          transformPastedText: true,  // 这个会先处理粘贴的文本
          transformCopiedText: true,
        }),
      ],
      content: "<p></p>",
    });

    const pastedText = `$$
\\begin{aligned}
\\mathcal{R}_{momentum} &= \\rho (\\mathbf{u} \\cdot \\nabla)\\mathbf{u} - \\nabla \\cdot \\sigma(\\mathbf{u}, p) + \\alpha(\\gamma)\\mathbf{u} \\\\
\\mathcal{R}_{continuity} &= \\nabla \\cdot \\mathbf{u} \\\\
\\mathcal{R}_{energy} &= \\rho C_p (\\mathbf{u} \\cdot \\nabla T) - \\nabla \\cdot (k(\\gamma) \\nabla T) - Q
\\end{aligned}
$$`;

    console.log("=== Original text ===");
    console.log(pastedText);
    console.log("=====================");
    
    // 模拟粘贴
    editor.view.dispatch(
      editor.state.tr
        .insertText(pastedText)
        .setMeta("paste", true)
    );

    const json = editor.getJSON();
    const mathNodes = findAllMathNodes(json);
    
    console.log("=== After paste ===");
    console.log("Math nodes found:", mathNodes.length);
    
    if (mathNodes.length === 0) {
      console.log("NO MATH NODES - checking raw content...");
      console.log(JSON.stringify(json, null, 2));
    } else {
      mathNodes.forEach((node, i) => {
        console.log(`Math ${i+1}:`, {
          displayMode: node.attrs.displayMode,
          latexPreview: node.attrs.latex?.substring(0, 60) + "..."
        });
      });
    }

    // 检查 getMarkdown 输出
    const markdown = editor.storage.markdown.getMarkdown();
    console.log("=== Markdown output ===");
    console.log(markdown);
    console.log("======================");

    expect(mathNodes.length).toBe(1);
  });
});
