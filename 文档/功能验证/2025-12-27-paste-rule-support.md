# 粘贴规则增强验证

- [x] [Auto] 单元测试验证 `\( ... \)` 行内公式粘贴转换 (通过 `tests/paste.test.ts`)
- [x] [Auto] 单元测试验证 `\[ ... \]` 块级公式粘贴转换 (通过 `tests/paste.test.ts`)
- [x] [Auto] 回归测试 `$` 和 `$$` 粘贴支持 (通过 `tests/paste.test.ts`)
- [x] [Auto] 验证真实世界测试文本 `测试文本.md` (通过 `tests/paste.test.ts`)
- [x] [Manual] 引入 `PasteRule` 机制以应对 `tiptap-markdown` 可能的转义干扰
- [x] [Manual] 引入 `transformPastedText` 预处理机制，在 Markdown 解析前将 `\(...\)` 规范化为 `$ ... $`，彻底解决转义字符丢失问题。
