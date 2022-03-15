import MarkdownIt from 'markdown-it';
import Renderer from 'markdown-it/lib/renderer';
import Token from 'markdown-it/lib/token';

export function createRenderer(): IRenderer {
  const md = new MarkdownIt({
    linkify: true, // Autoconvert URL-like text to links
    breaks: true, // Convert '\n' in paragraphs into <br>
  });
  const context = new UrlRenderingContext();
  openUrlsInNewTab(md, context);
  renderExternalLinkIcon(md, context);
  return md;
}

export interface IRenderer {
  render(markdown: string): string;
}

class UrlRenderingContext {
  private data?: IUrlMetadata;

  notifyLinkOpen(metadata: IUrlMetadata): void {
    if (this.data) { throw Error(`data before is not handled: ${JSON.stringify(this.data)}`); }
    this.data = metadata;
  }

  handleLinkClose(): IUrlMetadata {
    const { data } = this;
    if (!data) { throw Error('data is already handled'); }
    this.data = undefined;
    return data;
  }
}

interface IUrlMetadata {
  href: string;
}

function openUrlsInNewTab(md: MarkdownIt, context: UrlRenderingContext) {
  // https://github.com/markdown-it/markdown-it/blob/12.2.0/docs/architecture.md#renderer
  const defaultRender = getDefaultRenderer(md, 'link_open');
  md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    if (!getTokenAttributeValue(token, 'target')) {
      token.attrPush(['target', '_blank']);
    }
    context.notifyLinkOpen({
      href: getTokenAttributeValue(token, 'href'),
    });
    return defaultRender(tokens, idx, options, env, self);
  };
}

function renderExternalLinkIcon(md: MarkdownIt, context: UrlRenderingContext) {
  const defaultRender = getDefaultRenderer(md, 'link_close');
  md.renderer.rules.link_close = (tokens, idx, options, env, self) => {
    const url = context.handleLinkClose();
    const isExternal = /^https?:/.test(url.href);
    const defaultRenderedToken = defaultRender(tokens, idx, options, env, self);
    if (isExternal) {
      return externalLinkIconHtml + defaultRenderedToken;
    }
    return defaultRenderedToken;
  };
}

const externalLinkIconHtml = `
  <svg
    fill="none"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="2"
    viewBox="0 0 24 24"
    stroke="currentColor"
    width="15"
    height="15"
  >
    <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
`;

function getDefaultRenderer(md: MarkdownIt, ruleName: string): Renderer.RenderRule {
  const renderer = md.renderer.rules[ruleName];
  if (renderer) {
    return renderer;
  }
  return (tokens, idx, options, _env, self) => {
    return self.renderToken(tokens, idx, options);
  };
}

function getTokenAttributeValue(token: Token, attributeName: string): string | undefined {
  const attributeIndex = token.attrIndex(attributeName);
  if (attributeIndex < 0) {
    return undefined;
  }
  const value = token.attrs[attributeIndex][1];
  return value;
}
