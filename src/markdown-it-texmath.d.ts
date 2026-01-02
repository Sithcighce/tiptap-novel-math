declare module "markdown-it-texmath" {
  import type MarkdownIt from "markdown-it";

  interface TexmathOptions {
    engine?: {
      renderToString: (latex: string, options?: { displayMode?: boolean }) => string;
    };
    delimiters?: string | string[];
    katexOptions?: Record<string, unknown>;
    outerSpace?: boolean;
  }

  function texmath(md: MarkdownIt, options?: TexmathOptions): void;
  export = texmath;
}
