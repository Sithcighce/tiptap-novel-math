import { Node, mergeAttributes, InputRule, PasteRule, Editor, ChainedCommands } from "@tiptap/core";
import { Plugin, type EditorState, type Transaction } from "@tiptap/pm/state";
import { ReactNodeViewRenderer } from "@tiptap/react";
import type { KatexOptions } from "katex";
import { MathNodeView } from "./math-node-view";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    mathematics: {
      setLatex: (attrs: { latex: string; displayMode?: boolean }) => ReturnType;
      unsetLatex: () => ReturnType;
    };
  }
}

export interface MathematicsOptions {
  shouldRender: (state: EditorState, pos: number) => boolean;
  katexOptions?: KatexOptions;
  HTMLAttributes: Record<string, any>;
}

export const Mathematics = Node.create<MathematicsOptions>({
  name: "math",
  inline: true,
  group: "inline",
  atom: true,
  selectable: true,
  marks: "",

  addAttributes() {
    return {
      latex: {
        default: "",
      },
      displayMode: {
        default: false,
      },
    };
  },

  addStorage() {
    return {
      markdown: {
        serialize: {
          math: (state: any, node: any) => {
            const latex = node.attrs.latex || "";
            const displayMode = node.attrs.displayMode;

            if (displayMode) {
              state.write(`$$${latex}$$`);
            } else {
              state.write(`$${latex}$`);
            }
          },
        },
      },
    };
  },

  addOptions() {
    return {
      shouldRender: (state, pos) => {
        const $pos = state.doc.resolve(pos);
        if (!$pos.parent.isTextblock) {
          return false;
        }
        return $pos.parent.type.name !== "codeBlock";
      },
      katexOptions: {
        throwOnError: false,
      },
      HTMLAttributes: {},
    };
  },

  addInputRules() {
    return [
      new InputRule({
        find: /\$\$((?:.|[\r\n])*?)\$\$/,
        handler: ({ state, range, match, chain }) => {
          const { from, to } = range;
          const latex = match[1].trim();
          if (latex) {
            chain()
              .focus()
              .insertContentAt(
                { from, to },
                {
                  type: "math",
                  attrs: { latex, displayMode: true },
                }
              )
              .setTextSelection(from + 1)
              .run();
          }
        },
      }),
      new InputRule({
        find: /^\$\$\s$/,
        handler: ({ state, range, match, chain }) => {
          chain()
            .focus()
            .deleteRange(range)
            .insertContent({
              type: "math",
              attrs: { latex: "", displayMode: true },
            })
            .run();
        },
      }),
      new InputRule({
        find: /\$([^$]+)\$/,
        handler: ({ state, range, match, chain }) => {
          const { from, to } = range;
          const latex = match[1].trim();
          if (latex) {
            chain()
              .focus()
              .insertContentAt(
                { from, to },
                {
                  type: "math",
                  attrs: { latex, displayMode: false },
                }
              )
              .setTextSelection(from + 1)
              .run();
          }
        },
      }),
    ];
  },

  addPasteRules() {
    return [
      new PasteRule({
        find: /\\\[((?:.|[\r\n])*?)\\\]/g,
        handler: ({ state, range, match, chain }) => {
          const latex = match[1].trim().replace(/[\uFFFC\u200B]/g, "");
          if (latex) {
            chain()
              .focus()
              .insertContentAt(
                { from: range.from, to: range.to },
                {
                  type: this.name,
                  attrs: { latex, displayMode: true },
                }
              )
              .run();
          }
        },
      }),
      new PasteRule({
        find: /\$\$((?:.|[\r\n])*?)\$\$/g,
        handler: ({ state, range, match, chain }) => {
          const latex = match[1].trim().replace(/[\uFFFC\u200B]/g, "");
          if (latex) {
            chain()
              .focus()
              .insertContentAt(
                { from: range.from, to: range.to },
                {
                  type: this.name,
                  attrs: { latex, displayMode: true },
                }
              )
              .run();
          }
        },
      }),
      new PasteRule({
        find: /\\\(((?:.|[\r\n])*?)\\\)/g,
        handler: ({ state, range, match, chain }) => {
          const latex = match[1].trim().replace(/[\uFFFC\u200B]/g, "");
          if (latex) {
            chain()
              .focus()
              .insertContentAt(
                { from: range.from, to: range.to },
                {
                  type: this.name,
                  attrs: { latex, displayMode: false },
                }
              )
              .run();
          }
        },
      }),
      new PasteRule({
        find: /\$([^$\n]+?)\$/g,
        handler: ({ state, range, match, chain }) => {
          const latex = match[1].trim().replace(/[\uFFFC\u200B]/g, "");
          if (latex) {
            chain()
              .focus()
              .insertContentAt(
                { from: range.from, to: range.to },
                {
                  type: this.name,
                  attrs: { latex, displayMode: false },
                }
              )
              .run();
          }
        },
      }),
    ];
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          transformPastedText(text) {
            // Clean invisible characters that break KaTeX
            text = text.replace(/[\uFFFC\u200B]/g, "");
            
            text = text.replace(/\\\[((?:.|[\r\n])*?)\\\]/g, "$$$$$1$$$$");
            text = text.replace(/\\\(((?:.|[\r\n])*?)\\\)/g, "$$$1$$");
            return text;
          },
          transformPastedHTML(html) {
            // Clean invisible characters that break KaTeX
            html = html.replace(/[\uFFFC\u200B]/g, "");
            
            // Replace in HTML content. 
            // Warning: This is a naive replacement. It might affect attributes, but for GPT paste it's usually fine.
            html = html.replace(/\\\[((?:.|[\r\n])*?)\\\]/g, "$$$$$1$$$$");
            html = html.replace(/\\\(((?:.|[\r\n])*?)\\\)/g, "$$$1$$");
            return html;
          },
        },
      }),
    ];
  },

  addCommands() {
    return {
      setLatex:
        ({ latex, displayMode }: { latex: string; displayMode?: boolean }) =>
        ({ chain, state }: { chain: () => ChainedCommands; state: EditorState }) => {
          if (!latex) {
            return false;
          }
          
          // Strip existing delimiters
          if (latex.startsWith("$$") && latex.endsWith("$$")) {
             latex = latex.slice(2, -2);
             displayMode = true;
          } else if (latex.startsWith("$") && latex.endsWith("$")) {
             latex = latex.slice(1, -1);
          }
          
          const { from, to, $anchor } = state.selection;

          if (!this.options.shouldRender(state, $anchor.pos)) {
            return false;
          }

          return chain()
            .insertContentAt(
              { from: from, to: to },
              {
                type: "math",
                attrs: {
                  latex: latex,
                  displayMode: displayMode ?? false,
                },
              }
            )
            .setTextSelection({ from: from, to: from + 1 })
            .run();
        },
      unsetLatex:
        () =>
        ({ editor, state, chain }: { editor: Editor; state: EditorState; chain: () => ChainedCommands }) => {
          const latex = editor.getAttributes(this.name).latex;

          if (typeof latex !== "string") {
            return false;
          }

          const { from, to } = state.selection;
          const textToInsert = latex;

          return chain()
            .command(({ tr }: { tr: Transaction }) => {
              tr.insertText(textToInsert, from, to);
              return true;
            })
            .setTextSelection({
              from: from,
              to: from + textToInsert.length,
            })
            .run();
        },
    };
  },

  parseHTML() {
    return [{ tag: `span[data-type="${this.name}"]` }];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        "data-type": this.name,
        "data-latex": node.attrs.latex,
      }),
    ];
  },

  renderText({ node }) {
    return node.attrs["latex"] ?? "";
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathNodeView);
  },
});
