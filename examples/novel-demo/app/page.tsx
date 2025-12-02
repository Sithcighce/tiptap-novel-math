import NovelEditor from "@/components/editor/novel-editor";
import { Github } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="flex-1 container mx-auto py-12 px-4 max-w-5xl">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight lg:text-5xl">
              Tiptap Novel Math
            </h1>
            <p className="text-muted-foreground text-lg max-w-[600px]">
              A robust Tiptap extension for editing and rendering LaTeX mathematical equations. 
              Seamlessly integrates with Novel and other Tiptap-based editors.
            </p>
          </div>
          <div className="flex gap-4">
            <a
              href="https://github.com/Sithcighce/tiptap-novel-math"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-medium text-sm"
            >
              <Github className="h-4 w-4" />
              View on GitHub
            </a>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-12">
           <div className="p-6 rounded-xl bg-card border shadow-sm">
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                🧮 LaTeX Support
              </h3>
              <p className="text-sm text-muted-foreground">
                Full support for LaTeX syntax powered by KaTeX. Render complex equations with ease.
              </p>
           </div>
           <div className="p-6 rounded-xl bg-card border shadow-sm">
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                ✨ Inline & Block
              </h3>
               <p className="text-sm text-muted-foreground">
                Switch effortlessly between inline math <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">E=mc²</span> and block-level display equations.
              </p>
           </div>
            <div className="p-6 rounded-xl bg-card border shadow-sm">
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                🖱️ User Friendly
              </h3>
               <p className="text-sm text-muted-foreground">
                Click to edit, live preview, and intuitive UI controls. Designed for a great writing experience.
              </p>
           </div>
        </div>

        <div className="rounded-xl border bg-card shadow-sm overflow-hidden min-h-[500px] flex flex-col">
           <div className="border-b bg-muted/30 px-4 py-2.5 flex items-center gap-2">
             <div className="flex gap-1.5">
               <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
               <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
               <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
             </div>
             <span className="text-xs text-muted-foreground ml-2 font-mono">Interactive Demo</span>
           </div>
           <div className="p-8 md:p-12 bg-background flex-1">
             <NovelEditor />
           </div>
        </div>
      </div>
      
      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
        <p>MIT License © 2025</p>
      </footer>
    </main>
  );
}
