import { ensureDb } from '@/db/bootstrap';
import { claimNextJob, completeJob, failJob, updateJobProgress } from '@/server/jobs/queue';
import { runJob } from '@/server/jobs/handlers';
import { startScheduler } from './scheduler';
import { ensureMediaDirs } from '@/server/paths';

const POLL_MS = Number(process.env.WORKER_POLL_MS ?? 1500);
let stopping = false;

async function loop() {
  while (!stopping) {
    const job = claimNextJob();
    if (!job) {
      await new Promise((r) => setTimeout(r, POLL_MS));
      continue;
    }
    console.log(`[worker] running ${job.kind} (${job.id})`);
    try {
      await runJob(job, (pct, msg) => updateJobProgress(job.id, pct, msg));
      completeJob(job.id);
      console.log(`[worker] done    ${job.kind} (${job.id})`);
    } catch (err) {
      const willRetry = job.attempts < job.maxAttempts;
      failJob(job.id, err, willRetry);
      console.error(`[worker] failed  ${job.kind} (${job.id}) attempt ${job.attempts}/${job.maxAttempts}:`, err);
    }
  }
}

function gracefulExit() {
  console.log('[worker] shutting down…');
  stopping = true;
  setTimeout(() => process.exit(0), 100);
}

process.on('SIGINT', gracefulExit);
process.on('SIGTERM', gracefulExit);

ensureDb();
ensureMediaDirs();
startScheduler();
console.log('[worker] ready');
loop().catch((err) => {
  console.error('[worker] fatal:', err);
  process.exit(1);
});
