import { describe, it, expect } from 'vitest';
import Database from 'better-sqlite3';
import { FTS_BM25_WEIGHTS } from '@/server/search';

// The production search index is an FTS5 table whose first three columns are
// UNINDEXED (doc_type, doc_id, url), followed by title and body. bm25() weights
// are positional, so the title boost only works if the weight array accounts for
// those leading columns. This test pins that behaviour: a title-only match must
// rank above a body-only match for the same rare term.
describe('search ranking', () => {
  it('weights title matches above body matches', () => {
    const db = new Database(':memory:');
    db.exec(
      `CREATE VIRTUAL TABLE si USING fts5(
         doc_type UNINDEXED, doc_id UNINDEXED, url UNINDEXED, title, body,
         tokenize = 'porter unicode61'
       );`,
    );
    const ins = db.prepare('INSERT INTO si VALUES (?,?,?,?,?)');
    // Filler rows keep the search term rare so bm25 IDF stays positive.
    for (let i = 0; i < 20; i++) {
      ins.run('video', 'F' + i, '/f' + i, 'filler topic ' + i, 'lorem ipsum dolor sit amet ' + i);
    }
    ins.run('video', 'A', '/a', 'antenna basics', 'unrelated text about radios and waves'); // term in title
    ins.run('video', 'B', '/b', 'beginner radio guide', 'antenna antenna deep dive into the antenna topic'); // term in body

    const weights = FTS_BM25_WEIGHTS.join(', ');
    const rows = db
      .prepare(`SELECT doc_id FROM si WHERE si MATCH '"antenna"*' ORDER BY bm25(si, ${weights})`)
      .all() as { doc_id: string }[];

    expect(rows.map((r) => r.doc_id)).toEqual(['A', 'B']);
    db.close();
  });
});
