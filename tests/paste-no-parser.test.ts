/**
 * 测试：不使用 MarkdownLatexParser 的粘贴行为
 */
import { describe, it, expect, afterEach } from "vitest";
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import { Mathematics } from "../src/index";  // 注意：不导入 MarkdownLatexParser

describe("Paste without MarkdownLatexParser", () => {
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

  it("should handle pasted $$...$$ WITHOUT MarkdownLatexParser", () => {
    editor = new Editor({
      extensions: [
        StarterKit,
        Mathematics,
        // 注意：没有 MarkdownLatexParser！
        Markdown.configure({
          html: true,
          transformPastedText: true,
          transformCopiedText: true,
        }),
      ],
      content: "<p></p>",
    });

    const pastedText = `$$
\\begin{aligned}
\\mathcal{R}_{momentum} &= \\rho (\\mathbf{u} \\cdot \\nabla)\\mathbf{u}
\\end{aligned}
$$`;

    console.log("=== Pasting WITHOUT MarkdownLatexParser ===");
    
    // 模拟粘贴
    editor.view.dispatch(
      editor.state.tr
        .insertText(pastedText)
        .setMeta("paste", true)
    );

    const json = editor.getJSON();
    const mathNodes = findAllMathNodes(json);
    console.log("Found math nodes:", mathNodes.length);
    
    if (mathNodes.length > 0) {
      console.log("Math node:", {
        displayMode: mathNodes[0].attrs.displayMode,
        latex: mathNodes[0].attrs.latex?.substring(0, 50) + "..."
      });
    } else {
      console.log("NO MATH NODES FOUND!");
      console.log("Raw JSON:", JSON.stringify(json, null, 2));
    }

    expect(mathNodes.length).toBe(1);
    expect(mathNodes[0].attrs.displayMode).toBe(true);
  });
});
