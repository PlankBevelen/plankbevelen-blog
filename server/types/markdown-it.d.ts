declare module 'markdown-it' {
  interface Token {
    attrGet(name: string): string | null
    attrSet(name: string, value: string): void
  }

  interface Renderer {
    rules: Record<string, RenderRule | undefined>
    renderToken(tokens: Token[], idx: number, options: unknown): string
  }

  type RenderRule = (
    tokens: Token[],
    idx: number,
    options: unknown,
    env: unknown,
    self: Renderer
  ) => string

  interface MarkdownIt {
    render(src: string): string
    renderer: Renderer
  }

  interface MarkdownItOptions {
    html?: boolean
    breaks?: boolean
    linkify?: boolean
  }

  interface MarkdownItConstructor {
    new (options?: MarkdownItOptions): MarkdownIt
  }

  const MarkdownIt: MarkdownItConstructor
  export default MarkdownIt
}
