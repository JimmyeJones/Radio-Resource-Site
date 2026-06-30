import { describe, it, expect } from 'vitest';
import { parseFeed } from '@/server/jobs/handlers/feed-poll';

describe('feed parser', () => {
  it('parses RSS 2.0 items', () => {
    const xml = `<?xml version="1.0"?><rss><channel><title>My Blog</title>
      <item><title>First post</title><link>https://ex.com/1</link><guid>https://ex.com/1</guid><pubDate>Mon, 15 Jan 2024 10:00:00 GMT</pubDate></item>
      <item><title>Second post</title><link>https://ex.com/2</link><guid>g2</guid></item>
    </channel></rss>`;
    const { title, items } = parseFeed(xml);
    expect(title).toBe('My Blog');
    expect(items).toHaveLength(2);
    expect(items[0].title).toBe('First post');
    expect(items[0].url).toBe('https://ex.com/1');
  });

  it('parses Atom entries and audio enclosures', () => {
    const xml = `<feed><title>Pod</title>
      <entry><title>Ep 1</title><link href="https://ex.com/ep1"/><id>ep1</id>
        <enclosure url="https://ex.com/ep1.mp3" type="audio/mpeg"/></entry>
    </feed>`;
    const { items } = parseFeed(xml);
    expect(items).toHaveLength(1);
    expect(items[0].url).toBe('https://ex.com/ep1');
    expect(items[0].audioUrl).toBe('https://ex.com/ep1.mp3');
  });
});
