import { describe, it, expect } from 'vitest'
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { Mathematics } from '../src/index'

describe('Mathematics Hydration', () => {
  it('should hydrate inline latex from plain text on load', async () => {
    // 模拟从数据库加载的纯文本
    const content = '<p>The formula is $E=mc^2$ in physics.</p>'
    
    const editor = new Editor({
      extensions: [
        StarterKit,
        Mathematics,
      ],
      content: content, 
    })

    // Wait for async onCreate dispatch to complete
    await new Promise(resolve => setTimeout(resolve, 10))

    // 检查 JSON 结构 - 这是最可靠的验证方式
    const json = editor.getJSON()
    const paragraph = json.content?.[0]
    expect(paragraph?.type).toBe('paragraph')
    
    const mathNode = paragraph?.content?.find((n: any) => n.type === 'math')
    expect(mathNode).toBeDefined()
    expect(mathNode?.attrs?.latex).toBe('E=mc^2')
    expect(mathNode?.attrs?.displayMode).toBe(false)
  })

  it('should hydrate block latex from plain text on load', async () => {
    const content = '<p>$$E=mc^2$$</p>'
    
    const editor = new Editor({
      extensions: [
        StarterKit,
        Mathematics,
      ],
      content: content,
    })

    // Wait for async onCreate dispatch to complete
    await new Promise(resolve => setTimeout(resolve, 10))

    const json = editor.getJSON()
    const paragraph = json.content?.[0]
    const mathNode = paragraph?.content?.find((n: any) => n.type === 'math')
    
    expect(mathNode).toBeDefined()
    expect(mathNode?.attrs?.latex).toBe('E=mc^2')
    expect(mathNode?.attrs?.displayMode).toBe(true)
  })

  it('should not hydrate latex inside code blocks', () => {
    // 使用 HTML 明确告知 Tiptap 这是一个 code block
    const content = '<pre><code>$E=mc^2$</code></pre>'
    
    const editor = new Editor({
      extensions: [
        StarterKit,
        Mathematics,
      ],
      content: content,
    })

    const json = editor.getJSON()
    const codeBlock = json.content?.[0]
    expect(codeBlock?.type).toBe('codeBlock')
    
    const textNode = codeBlock?.content?.[0]
    expect(textNode?.type).toBe('text')
    expect(textNode?.text).toContain('$E=mc^2$')
    
    const hasMath = JSON.stringify(json).includes('"type":"math"')
    expect(hasMath).toBe(false)
  })
  
  it('should use correct storage namespace', () => {
    const editor = new Editor({
      extensions: [
        StarterKit,
        Mathematics
      ],
      content: '<p>test</p>'
    })
    
    // The storage is mounted at editor.storage.math
    // Inside it, we expect our 'markdown' property for tiptap-markdown compatibility
    expect(editor.storage.math).toBeDefined()
    expect(editor.storage.math.markdown).toBeDefined()
    expect(editor.storage.math.markdown.serialize).toBeDefined()
  })
})
