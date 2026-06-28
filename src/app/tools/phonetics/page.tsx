'use client';
import { useState } from 'react';
import { NATO_PHONETIC, spellPhonetic } from '@/lib/tools/phonetics';
import { PageHeader } from '@/components/page-header';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function PhoneticsPage() {
  const [input, setInput] = useState('W1AW');
  const phonetic = spellPhonetic(input);

  return (
    <div>
      <PageHeader
        title="NATO/ITU Phonetic Alphabet"
        description="The official ICAO/NATO/ITU spelling alphabet, plus a quick callsign speller."
      />

      <Card className="mb-8">
        <label htmlFor="speller" className="mb-2 block text-sm font-medium">
          Spell a callsign or word
        </label>
        <Input
          id="speller"
          value={input}
          autoComplete="off"
          onChange={(e) => setInput(e.target.value)}
          className="font-mono uppercase tracking-wide"
        />
        <p className="mt-4 text-lg" aria-live="polite">
          {phonetic.length ? (
            phonetic.map((w, i) => (
              <span key={i} className="mr-2 inline-block">
                <strong className="text-accent">{w}</strong>
              </span>
            ))
          ) : (
            <span className="text-muted">Type something above.</span>
          )}
        </p>
      </Card>

      <h2 className="mb-3 text-xl font-semibold">Alphabet table</h2>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {Object.entries(NATO_PHONETIC).map(([letter, word]) => (
          <li
            key={letter}
            className="flex items-center justify-between gap-2 rounded-md border border-border bg-surface px-3 py-2"
          >
            <span className="font-mono text-lg font-semibold text-accent">{letter}</span>
            <span className="text-sm">{word}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
