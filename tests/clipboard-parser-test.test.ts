/**
 * 测试 clipboardTextParser 的 inline 模式
 */
import { describe, it, expect } from "vitest";
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import { Mathematics } from "../src/index";

describe("Clipboard Parser", () => {
  it("should test inline: true parsing mode", () => {
    const editor = new Editor({
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

    const formula = `$$
\\begin{align}
 \\text{field condition:}& \\begin{cases}
\\text{far field: } & \\vec{r}\\gg \\frac{c}{\\omega } \\\\
\\text{medium field:} & \\vec{r} \\sim \\frac{c}{\\omega} \\\\
\\text{near field:} & \\vec{r} \\ll \\frac{c}{\\omega}
\\end{cases} \\\\

  \\text{far field approximation:} & \\begin{cases}
\\frac{1}{|\\vec{r}-\\vec{\\xi}|} & = \\frac{1}{|\\vec{r}|}
\\end{cases}
\\end{align}
$$`;

    const storage = editor.storage.markdown;
    if (storage && storage.parser) {
      // 这是 tiptap-markdown 在粘贴时使用的模式
      const inlineHtml = storage.parser.parse(formula, { inline: true });
      console.log("=== Inline mode parsing (used by clipboardTextParser) ===");
      console.log("Contains data-type=math:", inlineHtml.includes('data-type="math"'));
      console.log("Output preview:", inlineHtml.substring(0, 400));
    }

    editor.destroy();
  });
});
