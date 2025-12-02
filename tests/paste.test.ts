import { describe, it, expect } from "vitest";
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { Mathematics, MarkdownLatexParser } from "../src/index";

const createEditor = () => {
  return new Editor({
    extensions: [StarterKit, Mathematics, MarkdownLatexParser],
    content: "<p></p>",
  });
};

describe("Markdown Latex Parser (Paste)", () => {
  it("should convert pasted inline latex $...$ to math node", () => {
    const editor = createEditor();
    
    // Simulate a paste transaction
    // We manually create a transaction that inserts text and marks it as 'paste'
    editor.view.dispatch(
      editor.state.tr
        .insertText("Check this out: $E=mc^2$")
        .setMeta("paste", true) // This triggers the plugin
    );

    const json = editor.getJSON();
    const content = json.content?.[0]?.content;
    
    // Expected structure: Text("Check this out: "), Math("E=mc^2")
    expect(content).toHaveLength(2);
    expect(content?.[0].text).toBe("Check this out: ");
    expect(content?.[1].type).toBe("math");
    expect(content?.[1].attrs?.latex).toBe("E=mc^2");
  });

  it("should convert pasted block latex $$...$$ to math node with displayMode", () => {
    const editor = createEditor();
    
    editor.view.dispatch(
      editor.state.tr
        .insertText("Block: $$\\sum_{i=1}^n i$$")
        .setMeta("paste", true)
    );

    const json = editor.getJSON();
    const content = json.content?.[0]?.content;
    
    const mathNode = content?.[1];
    expect(mathNode?.type).toBe("math");
    expect(mathNode?.attrs?.latex).toBe("\\sum_{i=1}^n i");
    expect(mathNode?.attrs?.displayMode).toBe(true);
  });
});
