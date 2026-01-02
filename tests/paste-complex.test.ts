/**
 * 测试复杂公式的粘贴解析
 */
import { describe, it, expect } from "vitest";
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import { Mathematics, MarkdownLatexParser } from "../src/index";

describe("Complex Formula Paste", () => {

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

  it("should parse complex formula via insertContent", () => {
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

    // 用户报告的无法解析的公式
    const formula = `$$
\\begin{align}
 \\text{field condition:}& \\begin{cases}
\\text{far field: } & \\vec{r}\\gg \\frac{c}{\\omega } \\\\
\\text{medium field:} & \\vec{r} \\sim \\frac{c}{\\omega} \\\\
\\text{near field:} & \\vec{r} \\ll \\frac{c}{\\omega}
\\end{cases} \\\\

  \\text{far field approximation:} & \\begin{cases}
\\frac{1}{|\\vec{r}-\\vec{\\xi}|} & = \\frac{1}{|\\vec{r}|} + (-\\vec{\\xi})\\cdot \\nabla \\frac{1}{|\\vec{r}|} + \\dots & \\sim\\frac{{1}}{|r|}\\\\
\\frac{\\omega}{c}|\\vec{r}-\\vec{\\xi} | & = \\frac{\\omega}{c}\\times(|\\vec{r}| + (-\\vec{\\xi})\\cdot \\nabla |\\vec{r}| + \\dots) & \\\\
 & \\sim \\overset{\\text{Electrical Dipole} }{\\vec{k}\\cdot \\vec{r}}
\\end{cases}
\\end{align}
$$`;

    // 模拟粘贴 - 使用 insertContent
    editor.commands.insertContent(formula);
    
    const json = editor.getJSON();
    const mathNodes = findAllMathNodes(json);
    
    console.log("=== insertContent result ===");
    console.log("Math nodes found:", mathNodes.length);
    
    if (mathNodes.length > 0) {
      console.log("displayMode:", mathNodes[0].attrs.displayMode);
    } else {
      console.log("NO MATH NODES - checking raw content");
      console.log(JSON.stringify(json, null, 2).substring(0, 1000));
    }
    
    editor.destroy();
    expect(mathNodes.length).toBe(1);
  });

  it("should parse formula via tiptap-markdown parser directly", () => {
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

    // 获取 markdown parser 扩展
    const mdExtension = editor.extensionManager.extensions.find(
      e => e.name === 'markdown'
    );
    
    console.log("=== Markdown extension ===");
    console.log("Found:", !!mdExtension);
    
    // 直接测试 Markdown storage 的解析
    const storage = editor.storage.markdown;
    console.log("Storage:", !!storage);
    
    if (storage && storage.parser) {
      const formula = `$$
\\begin{align}
\\text{test} & \\begin{cases} a \\\\ b \\end{cases}
\\end{align}
$$`;
      
      const html = storage.parser.parse(formula);
      console.log("Parsed HTML:", html.substring(0, 500));
    }
    
    editor.destroy();
  });
});
