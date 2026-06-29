'use client';
import { useMemo, useState } from 'react';
import type { ExamPool } from '@/lib/exam';
import { shuffle } from '@/lib/exam';
import { recordAttemptAction } from '@/server/actions/exam';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/cn';
import { RotateCw, GraduationCap, Layers } from 'lucide-react';

type Mode = 'menu' | 'flashcards' | 'test';

export function StudyClient({ pool }: { pool: ExamPool }) {
  const [mode, setMode] = useState<Mode>('menu');

  if (mode === 'flashcards') return <Flashcards pool={pool} onExit={() => setMode('menu')} />;
  if (mode === 'test') return <PracticeTest pool={pool} onExit={() => setMode('menu')} />;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <button type="button" onClick={() => setMode('flashcards')} className="text-left focus:outline-none">
        <Card className="h-full transition-colors hover:border-accent">
          <Layers className="mb-2 h-6 w-6 text-accent" aria-hidden />
          <CardTitle>Flashcards</CardTitle>
          <p className="mt-1 text-sm text-muted">Flip through questions and reveal the answer. No scoring.</p>
        </Card>
      </button>
      <button type="button" onClick={() => setMode('test')} className="text-left focus:outline-none">
        <Card className="h-full transition-colors hover:border-accent">
          <GraduationCap className="mb-2 h-6 w-6 text-accent" aria-hidden />
          <CardTitle>Practice test</CardTitle>
          <p className="mt-1 text-sm text-muted">Randomized questions, scored and saved to your history.</p>
        </Card>
      </button>
    </div>
  );
}

function Flashcards({ pool, onExit }: { pool: ExamPool; onExit: () => void }) {
  const deck = useMemo(() => shuffle(pool.questions), [pool]);
  const [i, setI] = useState(0);
  const [show, setShow] = useState(false);
  const q = deck[i];

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm text-muted">Card {i + 1} of {deck.length}</span>
        <Button variant="ghost" size="sm" onClick={onExit}>Done</Button>
      </div>
      <Card>
        <p className="mb-1 font-mono text-xs text-muted">{q.id}</p>
        <p className="text-lg font-medium">{q.question}</p>
        {show ? (
          <p className="mt-4 rounded-lg bg-success/10 p-3 text-success">{q.answers[q.correct]}</p>
        ) : null}
        <div className="mt-4 flex gap-2">
          <Button variant="secondary" onClick={() => setShow((s) => !s)}>{show ? 'Hide' : 'Reveal answer'}</Button>
          <Button
            onClick={() => { setShow(false); setI((n) => (n + 1) % deck.length); }}
          >
            Next
          </Button>
        </div>
      </Card>
    </div>
  );
}

function PracticeTest({ pool, onExit }: { pool: ExamPool; onExit: () => void }) {
  const size = Math.min(10, pool.questions.length);
  const [quiz, setQuiz] = useState(() =>
    shuffle(pool.questions).slice(0, size).map((q) => ({ q, order: shuffle(q.answers.map((_, i) => i)) })),
  );
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const score = quiz.filter(({ q }) => answers[q.id] === q.correct).length;

  function restart() {
    setQuiz(shuffle(pool.questions).slice(0, size).map((q) => ({ q, order: shuffle(q.answers.map((_, i) => i)) })));
    setAnswers({});
    setSubmitted(false);
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm text-muted">{size} questions</span>
        <Button variant="ghost" size="sm" onClick={onExit}>Exit</Button>
      </div>

      {submitted ? (
        <Card className="mb-4">
          <CardTitle>Score: {score} / {quiz.length} ({Math.round((100 * score) / quiz.length)}%)</CardTitle>
          <div className="mt-3 flex gap-2">
            <Button onClick={restart}><RotateCw className="h-4 w-4" aria-hidden /> New test</Button>
          </div>
        </Card>
      ) : null}

      <ol className="space-y-4">
        {quiz.map(({ q, order }, idx) => (
          <li key={q.id}>
            <Card>
              <p className="mb-2"><span className="mr-2 font-mono text-xs text-muted">{idx + 1}.</span>{q.question}</p>
              <ul className="space-y-1.5">
                {order.map((ai) => {
                  const chosen = answers[q.id] === ai;
                  const correct = q.correct === ai;
                  return (
                    <li key={ai}>
                      <button
                        type="button"
                        disabled={submitted}
                        onClick={() => setAnswers((a) => ({ ...a, [q.id]: ai }))}
                        className={cn(
                          'w-full rounded-md border px-3 py-2 text-left text-sm',
                          submitted && correct && 'border-success bg-success/10',
                          submitted && chosen && !correct && 'border-danger bg-danger/10',
                          !submitted && chosen && 'border-accent bg-accent/10',
                          !submitted && !chosen && 'border-border hover:bg-elevated',
                          submitted && !correct && !chosen && 'border-border',
                        )}
                      >
                        {q.answers[ai]}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </Card>
          </li>
        ))}
      </ol>

      {!submitted ? (
        <div className="mt-4">
          <Button
            disabled={Object.keys(answers).length < quiz.length}
            onClick={() => {
              setSubmitted(true);
              void recordAttemptAction(pool.pool, quiz.length, score);
            }}
          >
            Submit ({Object.keys(answers).length}/{quiz.length})
          </Button>
        </div>
      ) : null}
    </div>
  );
}
