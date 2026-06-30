import { describe, it, expect } from 'vitest';
import { renderMarkdown } from '@/lib/markdown';

describe('renderMarkdown block elements', () => {
  it('renders ATX headings h1–h4', () => {
    expect(renderMarkdown('# Hello')).toBe('<h1>Hello</h1>');
    expect(renderMarkdown('### Sub')).toBe('<h3>Sub</h3>');
    // Five hashes is not a heading (only 1–4 supported) — falls through to a paragraph.
    expect(renderMarkdown('##### Nope')).toBe('<p>##### Nope</p>');
  });

  it('renders unordered and ordered lists, closing the list at the end', () => {
    expect(renderMarkdown('- a\n- b')).toBe('<ul>\n<li>a</li>\n<li>b</li>\n</ul>');
    expect(renderMarkdown('1. one\n2. two')).toBe('<ol>\n<li>one</li>\n<li>two</li>\n</ol>');
  });

  it('switches between list types without leaving an unclosed list', () => {
    expect(renderMarkdown('- a\n1. b')).toBe('<ul>\n<li>a</li>\n</ul>\n<ol>\n<li>b</li>\n</ol>');
  });

  it('wraps fenced code blocks and escapes their contents verbatim', () => {
    expect(renderMarkdown('```\n<b>raw</b>\n```')).toBe(
      '<pre><code>\n&lt;b&gt;raw&lt;/b&gt;\n</code></pre>',
    );
  });

  it('closes an unterminated code block', () => {
    expect(renderMarkdown('```\ncode')).toBe('<pre><code>\ncode\n</code></pre>');
  });

  it('wraps plain text in a paragraph', () => {
    expect(renderMarkdown('just text')).toBe('<p>just text</p>');
  });
});

describe('renderMarkdown inline formatting', () => {
  it('renders code, bold, italic, and links', () => {
    expect(renderMarkdown('a `code` and **bold** and *em*')).toBe(
      '<p>a <code>code</code> and <strong>bold</strong> and <em>em</em></p>',
    );
  });

  it('renders http(s) links with safe rel/target attributes', () => {
    expect(renderMarkdown('[text](https://example.com)')).toBe(
      '<p><a href="https://example.com" rel="noopener noreferrer" target="_blank">text</a></p>',
    );
  });
});

describe('renderMarkdown sanitization', () => {
  it('escapes raw HTML so markup cannot be injected', () => {
    const out = renderMarkdown('<script>alert("x")</script>');
    expect(out).not.toContain('<script>');
    expect(out).toBe('<p>&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;</p>');
  });

  it('escapes ampersands', () => {
    expect(renderMarkdown('plain & stuff')).toBe('<p>plain &amp; stuff</p>');
  });

  it('does not linkify non-http(s) URI schemes', () => {
    const out = renderMarkdown('[x](javascript:alert(1))');
    expect(out).not.toContain('href="javascript');
    expect(out).toBe('<p>[x](javascript:alert(1))</p>');
  });
});
