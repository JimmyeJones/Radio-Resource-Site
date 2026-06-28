'use client';
import { useState, useTransition } from 'react';
import { saveSettingsAction } from '@/server/actions/settings';
import { Input, Select } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Save, MapPin } from 'lucide-react';
import type { Settings } from '@/db/schema';

export function SettingsForm({ initial }: { initial: Settings | null }) {
  const [pending, start] = useTransition();
  const [status, setStatus] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const res = await saveSettingsAction(fd);
      setStatus(res?.ok ? 'Saved.' : (res?.error ?? 'Failed'));
    });
  }

  function useGeolocation() {
    if (!navigator.geolocation) {
      setStatus('Geolocation is not supported by this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        (document.getElementById('qthLat') as HTMLInputElement).value = String(pos.coords.latitude.toFixed(5));
        (document.getElementById('qthLon') as HTMLInputElement).value = String(pos.coords.longitude.toFixed(5));
        (document.getElementById('qthGrid') as HTMLInputElement).value = '';
        setStatus('Picked up from geolocation. Save to persist.');
      },
      (err) => setStatus(err.message),
      { enableHighAccuracy: false, timeout: 8000 },
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card>
        <CardTitle className="mb-1">Your QTH</CardTitle>
        <CardDescription className="mb-4">
          Used for satellite pass predictions. Provide a Maidenhead grid square or latitude/longitude — either works.
        </CardDescription>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label htmlFor="qthGrid" className="mb-1 block text-sm font-medium">Maidenhead grid</label>
            <Input id="qthGrid" name="qthGrid" defaultValue={initial?.qthGrid ?? ''} placeholder="FN31pr" />
          </div>
          <div>
            <label htmlFor="qthLat" className="mb-1 block text-sm font-medium">Latitude</label>
            <Input id="qthLat" name="qthLat" type="number" step="0.00001" defaultValue={initial?.qthLat ?? ''} />
          </div>
          <div>
            <label htmlFor="qthLon" className="mb-1 block text-sm font-medium">Longitude</label>
            <Input id="qthLon" name="qthLon" type="number" step="0.00001" defaultValue={initial?.qthLon ?? ''} />
          </div>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div>
            <label htmlFor="qthElevationM" className="mb-1 block text-sm font-medium">Elevation (m)</label>
            <Input id="qthElevationM" name="qthElevationM" type="number" defaultValue={initial?.qthElevationM ?? 0} />
          </div>
          <div className="flex items-end">
            <Button type="button" variant="secondary" onClick={useGeolocation}>
              <MapPin className="h-4 w-4" aria-hidden /> Use browser geolocation
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <CardTitle className="mb-1">Downloads</CardTitle>
        <CardDescription className="mb-4">yt-dlp format string and quality cap.</CardDescription>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label htmlFor="downloadFormatCode" className="mb-1 block text-sm font-medium">Format selector</label>
            <Input
              id="downloadFormatCode"
              name="downloadFormatCode"
              defaultValue={initial?.downloadFormatCode ?? 'bv*+ba/b'}
              className="font-mono"
            />
          </div>
          <div>
            <label htmlFor="maxHeight" className="mb-1 block text-sm font-medium">Max height (px)</label>
            <Select id="maxHeight" name="maxHeight" defaultValue={String(initial?.maxHeight ?? 1080)}>
              {[480, 720, 1080, 1440, 2160].map((h) => (
                <option key={h} value={h}>{h}p</option>
              ))}
            </Select>
          </div>
          <div>
            <label htmlFor="defaultSubsLang" className="mb-1 block text-sm font-medium">Subtitle language</label>
            <Input id="defaultSubsLang" name="defaultSubsLang" defaultValue={initial?.defaultSubsLang ?? 'en'} />
          </div>
        </div>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          <Save className="h-4 w-4" aria-hidden /> Save settings
        </Button>
        {status ? <span role="status" aria-live="polite" className="text-sm">{status}</span> : null}
      </div>
    </form>
  );
}
