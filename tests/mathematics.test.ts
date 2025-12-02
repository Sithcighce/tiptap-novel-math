import { describe, it, expect } from "vitest";
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { Mathematics } from "../src/index";

// Helper to create an editor instance
const createEditor = (content = "") => {
  return new Editor({
    extensions: [StarterKit, Mathematics],
    content,
  });
};

describe("Mathematics Extension", () => {
  it("should render a math node from initial content", () => {
    const editor = createEditor('<p>Test <span data-type="math" latex="E=mc^2"></span></p>');
    const json = editor.getJSON();
    
    // Find the math node in the JSON tree
    const paragraph = json.content?.[0];
    const mathNode = paragraph?.content?.[1];

    expect(mathNode?.type).toBe("math");
    expect(mathNode?.attrs?.latex).toBe("E=mc^2");
  });

  it("should execute setLatex command correctly", () => {
    const editor = createEditor("<p>Hello World</p>");
    
    // Select "World"
    editor.chain().setTextSelection({ from: 7, to: 12 }).run();
    
    // Convert to Math
    editor.chain().setLatex({ latex: "World" }).run();

    const json = editor.getJSON();
    const paragraph = json.content?.[0];
    const mathNode = paragraph?.content?.[1];

    expect(mathNode?.type).toBe("math");
    expect(mathNode?.attrs?.latex).toBe("World");
  });

  it("should render as a SPAN tag (fix for div-in-p bug)", () => {
    const editor = createEditor();
    editor.chain().insertContent({
      type: "math",
      attrs: { latex: "x=y" }
    }).run();

    const html = editor.getHTML();
    // Check that it is a span and has the data-type attribute
    // We use a regex or looser check to avoid attribute order issues
    expect(html).toContain('<span');
    expect(html).toContain('data-type="math"');
    expect(html).toContain('x=y');
    expect(html).not.toContain('<div'); // Crucial: Ensure no divs are introduced
  });
});
