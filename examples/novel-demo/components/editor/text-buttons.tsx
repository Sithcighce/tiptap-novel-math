"use client";

import {
  Bold,
  Strikethrough,
  Underline,
  Italic,
  Code,
} from "lucide-react";
import { EditorBubbleItem, useEditor } from "novel";

export const TextButtons = () => {
  const { editor } = useEditor();
  if (!editor) return null;

  const items = [
    {
      name: "bold",
      icon: Bold,
      command: () => editor.chain().focus().toggleBold().run(),
      isActive: () => editor.isActive("bold"),
    },
    {
      name: "italic",
      icon: Italic,
      command: () => editor.chain().focus().toggleItalic().run(),
      isActive: () => editor.isActive("italic"),
    },
    {
      name: "underline",
      icon: Underline,
      command: () => editor.chain().focus().toggleUnderline().run(),
      isActive: () => editor.isActive("underline"),
    },
    {
      name: "strike",
      icon: Strikethrough,
      command: () => editor.chain().focus().toggleStrike().run(),
      isActive: () => editor.isActive("strike"),
    },
    {
      name: "code",
      icon: Code,
      command: () => editor.chain().focus().toggleCode().run(),
      isActive: () => editor.isActive("code"),
    },
  ];

  return (
    <div className="flex">
      {items.map((item) => (
        <EditorBubbleItem
          key={item.name}
          onSelect={item.command}
          className="p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <item.icon
            className={`h-4 w-4 ${item.isActive() ? "text-blue-500" : ""}`}
          />
        </EditorBubbleItem>
      ))}
    </div>
  );
};
