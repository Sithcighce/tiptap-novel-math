# tiptap-novel-math 架构说明

## 当前问题 (2026-01-02)

### 粘贴处理机制过于复杂（屎山警告⚠️）

目前有**三层**粘贴处理机制，这是不合理的：

1. **`tiptap-markdown` 的 `transformPastedText`**
   - 当粘贴纯文本时，通过 markdown-it 解析
   - `Mathematics.storage.markdown.parse.setup()` 配置 texmath 处理 LaTeX
   - 输出 `<span data-type="math">` HTML
   - 通过 `parseHTML()` 转换为 math 节点

2. **`Mathematics.addPasteRules()`** 
   - TipTap 内置的 PasteRule
   - 使用正则匹配 `$$...$$`、`\[...\]`、`$...$`、`\(...\)` 模式
   - 直接将匹配内容转换为 math 节点

3. **`MarkdownLatexParser`**（额外扩展）
   - appendTransaction 插件
   - 在粘贴事务后扫描文档中的文本节点
   - 查找并转换未解析的 LaTeX 模式

### 已知问题

1. **测试环境 vs 真实浏览器差异**
   - 所有单元测试都通过（`setContent`, `insertContent` 正常工作）
   - 但真实浏览器粘贴可能失败
   - 原因：浏览器粘贴事件的 `ClipboardEvent` 在测试环境无法模拟

2. **复杂公式解析失败**
   - 简单公式可以解析
   - 复杂嵌套公式（如 `\begin{align}` 嵌套 `\begin{cases}` 且中间有空行）可能失败
   - 具体失败位置未定位

3. **代码重复**
   - 多个地方有类似的正则表达式
   - 多个地方有类似的 LaTeX 解析逻辑

## 理想架构

应该只有**一个**粘贴处理入口：

```
粘贴事件
    ↓
tiptap-markdown 的 clipboardTextParser
    ↓
markdown-it + texmath 解析
    ↓
输出带 data-type="math" 的 HTML
    ↓
parseHTML() 转换为 math 节点
```

## TODO

- [ ] 移除 `addPasteRules()`（如果 markdown 解析能处理所有情况）
- [ ] 移除 `MarkdownLatexParser`（如果不需要备用）
- [ ] 或者：保留 `addPasteRules()` 作为唯一入口，移除 markdown 配置
- [ ] 添加真实浏览器 E2E 测试（Playwright）
- [ ] 定位复杂公式在真实浏览器中失败的根本原因

## 相关文件

- `src/extension.ts` - Mathematics 扩展，包含 `addPasteRules()` 和 markdown 配置
- `src/markdown-plugin.ts` - `MarkdownLatexParser` 备用扩展
- `apps/app/components/editor/extensions.tsx` - 应用中的扩展配置
