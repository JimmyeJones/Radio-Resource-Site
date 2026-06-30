'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { db } from '@/db/client';
import { qsos } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { indexQso, removeDoc } from '@/server/search';
import { lookupCallsign } from '@/lib/tools/prefixes';
import { parseAdif, toAdif, adifDateToUnix } from '@/lib/adif';

const schema = z.object({
  id: z.string().uuid().optional(),
  callsign: z.string().min(1).max(20),
  freqMhz: z.coerce.number().positive().optional().nullable(),
  band: z.string().max(20).optional().nullable(),
  mode: z.string().max(20).optional().nullable(),
  date: z.string().optional(),
  time: z.string().optional(),
  rstSent: z.string().max(10).optional().nullable(),
  rstRcvd: z.string().max(10).optional().nullable(),
  name: z.string().max(80).optional().nullable(),
  qth: z.string().max(120).optional().nullable(),
  grid: z.string().max(10).optional().nullable(),
  satellite: z.string().max(40).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export async function saveQsoAction(formData: FormData) {
  const parse = schema.safeParse({
    id: formData.get('id') || undefined,
    callsign: String(formData.get('callsign') ?? '').toUpperCase().trim(),
    freqMhz: formData.get('freqMhz') ? Number(formData.get('freqMhz')) : null,
    band: (formData.get('band') as string | null) || null,
    mode: (formData.get('mode') as string | null) || null,
    date: (formData.get('date') as string | null) || undefined,
    time: (formData.get('time') as string | null) || undefined,
    rstSent: (formData.get('rstSent') as string | null) || null,
    rstRcvd: (formData.get('rstRcvd') as string | null) || null,
    name: (formData.get('name') as string | null) || null,
    qth: (formData.get('qth') as string | null) || null,
    grid: (formData.get('grid') as string | null) || null,
    satellite: (formData.get('satellite') as string | null) || null,
    notes: (formData.get('notes') as string | null) || null,
  });
  if (!parse.success) return { ok: false, error: 'A callsign is required' };

  // Datetime from date+time inputs (local) → unix; default now.
  let qsoAt = Math.floor(Date.now() / 1000);
  if (parse.data.date) {
    const dt = new Date(`${parse.data.date}T${parse.data.time || '00:00'}`);
    if (!Number.isNaN(dt.getTime())) qsoAt = Math.floor(dt.getTime() / 1000);
  }

  const country = lookupCallsign(parse.data.callsign).entry?.country ?? null;
  const id = parse.data.id ?? randomUUID();
  const row = {
    callsign: parse.data.callsign,
    freqMhz: parse.data.freqMhz ?? null,
    band: parse.data.band ?? null,
    mode: parse.data.mode ?? null,
    qsoAt,
    rstSent: parse.data.rstSent ?? null,
    rstRcvd: parse.data.rstRcvd ?? null,
    name: parse.data.name ?? null,
    qth: parse.data.qth ?? null,
    grid: parse.data.grid ?? null,
    country,
    satellite: parse.data.satellite ?? null,
    notes: parse.data.notes ?? null,
  };
  if (parse.data.id) {
    db.update(qsos).set(row).where(eq(qsos.id, id)).run();
  } else {
    db.insert(qsos).values({ id, ...row }).run();
  }
  indexQso(id);
  revalidatePath('/logbook');
  return { ok: true, id };
}

export async function deleteQsoAction(id: string) {
  db.delete(qsos).where(eq(qsos.id, id)).run();
  removeDoc('qso', id);
  revalidatePath('/logbook');
}

export async function exportAdifAction(): Promise<string> {
  const rows = db.select().from(qsos).all();
  return toAdif(rows);
}

export async function importAdifAction(text: string) {
  const records = parseAdif(text);
  let n = 0;
  for (const r of records) {
    if (!r.call) continue;
    const callsign = r.call.toUpperCase();
    const id = randomUUID();
    db.insert(qsos)
      .values({
        id,
        callsign,
        freqMhz: r.freq ? Number(r.freq) || null : null,
        band: r.band ?? null,
        mode: r.mode ?? null,
        qsoAt: adifDateToUnix(r.qso_date, r.time_on),
        rstSent: r.rst_sent ?? null,
        rstRcvd: r.rst_rcvd ?? null,
        name: r.name ?? null,
        qth: r.qth ?? null,
        grid: r.gridsquare ?? null,
        country: r.country ?? lookupCallsign(callsign).entry?.country ?? null,
        satellite: r.sat_name ?? null,
        notes: r.comment ?? null,
      })
      .run();
    indexQso(id);
    n++;
  }
  revalidatePath('/logbook');
  return { ok: true, count: n };
}
