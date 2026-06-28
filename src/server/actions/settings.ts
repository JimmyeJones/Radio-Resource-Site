'use server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { db } from '@/db/client';
import { settings as settingsTbl } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { gridToLatLon, latLonToGrid } from '@/lib/tools/satellites';

const schema = z.object({
  qthGrid: z.string().optional().nullable(),
  qthLat: z.coerce.number().min(-90).max(90).optional().nullable(),
  qthLon: z.coerce.number().min(-180).max(180).optional().nullable(),
  qthElevationM: z.coerce.number().min(-500).max(9000).optional().nullable(),
  downloadFormatCode: z.string().min(1).max(200),
  maxHeight: z.coerce.number().int().min(144).max(4320),
  defaultSubsLang: z.string().min(2).max(8),
});

export async function saveSettingsAction(formData: FormData) {
  const parse = schema.safeParse({
    qthGrid: (formData.get('qthGrid') as string | null) || null,
    qthLat: formData.get('qthLat') ? Number(formData.get('qthLat')) : null,
    qthLon: formData.get('qthLon') ? Number(formData.get('qthLon')) : null,
    qthElevationM: formData.get('qthElevationM') ? Number(formData.get('qthElevationM')) : 0,
    downloadFormatCode: String(formData.get('downloadFormatCode') ?? 'bv*+ba/b'),
    maxHeight: Number(formData.get('maxHeight') ?? 1080),
    defaultSubsLang: String(formData.get('defaultSubsLang') ?? 'en'),
  });
  if (!parse.success) return { ok: false, error: parse.error.issues[0]?.message ?? 'Invalid' };

  let { qthGrid, qthLat, qthLon } = parse.data;
  if (qthGrid && (qthLat == null || qthLon == null)) {
    const ll = gridToLatLon(qthGrid);
    if (!ll) return { ok: false, error: 'Invalid Maidenhead grid' };
    qthLat = ll.lat;
    qthLon = ll.lon;
  } else if (qthLat != null && qthLon != null && !qthGrid) {
    qthGrid = latLonToGrid(qthLat, qthLon);
  }

  db.update(settingsTbl)
    .set({
      qthGrid: qthGrid ?? null,
      qthLat: qthLat ?? null,
      qthLon: qthLon ?? null,
      qthElevationM: parse.data.qthElevationM ?? 0,
      downloadFormatCode: parse.data.downloadFormatCode,
      maxHeight: parse.data.maxHeight,
      defaultSubsLang: parse.data.defaultSubsLang,
    })
    .where(eq(settingsTbl.id, 1))
    .run();
  revalidatePath('/settings');
  revalidatePath('/tools/satellites');
  return { ok: true };
}
