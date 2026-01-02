/**
 * 模拟真实浏览器粘贴行为
 * 测试 clipboardTextParser 路径
 */
import { describe, it, expect, afterEach } from "vitest";
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import { Mathematics } from "../src/index";

describe("Browser Paste Simulation", () => {
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

  it("DEBUG: 直接调用 markdown parser 看看发生什么", () => {
    editor = new Editor({
      extensions: [
        StarterKit,
        Mathematics,
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

    console.log("=== Input text ===");
    console.log(pastedText);

    // 直接调用 markdown parser，模拟 clipboardTextParser 的行为
    const parser = editor.storage.markdown?.parser;
    if (parser) {
      console.log("=== Parser found ===");
      
      // 模拟 inline: true（这是 clipboardTextParser 使用的选项）
      const parsedInline = parser.parse(pastedText, { inline: true });
      console.log("=== Parsed with inline:true ===");
      console.log(parsedInline);
      
      // 模拟 inline: false
      const parsedBlock = parser.parse(pastedText, { inline: false });
      console.log("=== Parsed with inline:false ===");
      console.log(parsedBlock);
    } else {
      console.log("No parser found in storage.markdown");
    }

    expect(true).toBe(true);
  });

  it("E2E: 使用 setContent 加载 parser 输出的 HTML", () => {
    editor = new Editor({
      extensions: [
        StarterKit,
        Mathematics,
        Markdown.configure({
          html: true,
          transformPastedText: true,
          transformCopiedText: true,
        }),
      ],
      content: "<p></p>",
    });

    // 这是 parser 会输出的 HTML
    const parsedHtml = `<span data-type="math" data-latex="\\begin{aligned}
\\mathcal{R}_{momentum} &amp;= \\rho (\\mathbf{u} \\cdot \\nabla)\\mathbf{u}
\\end{aligned}" data-display-mode="true"></span>`;

    console.log("=== Setting HTML content ===");
    console.log(parsedHtml);
    
    editor.commands.setContent(parsedHtml);
    
    const json = editor.getJSON();
    const mathNodes = findAllMathNodes(json);
    
    console.log("=== After setContent ===");
    console.log("Math nodes found:", mathNodes.length);
    if (mathNodes.length > 0) {
      console.log("displayMode:", mathNodes[0].attrs.displayMode);
      console.log("latex:", mathNodes[0].attrs.latex);
    }
    console.log("Full JSON:", JSON.stringify(json, null, 2));

    expect(mathNodes.length).toBe(1);
    expect(mathNodes[0].attrs.displayMode).toBe(true);
  });
});
