/**
 * 测试复杂嵌套公式的解析
 */
import { describe, it, expect, afterEach } from "vitest";
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import { Mathematics, MarkdownLatexParser } from "../src/index";

describe("Complex Formula Parsing", () => {
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

  it("should parse align with nested cases and empty lines", () => {
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

    console.log("=== Input formula ===");
    console.log(formula);
    console.log("=====================");

    // 测试 setContent
    editor.commands.setContent(formula);
    
    const json = editor.getJSON();
    const mathNodes = findAllMathNodes(json);
    
    console.log("=== After setContent ===");
    console.log("Math nodes found:", mathNodes.length);
    
    if (mathNodes.length > 0) {
      console.log("displayMode:", mathNodes[0].attrs.displayMode);
      console.log("latex preview:", mathNodes[0].attrs.latex?.substring(0, 100) + "...");
    } else {
      console.log("NO MATH NODES FOUND!");
      console.log("Raw content:", JSON.stringify(json, null, 2).substring(0, 500));
    }

    expect(mathNodes.length).toBe(1);
    expect(mathNodes[0].attrs.displayMode).toBe(true);
  });
});
