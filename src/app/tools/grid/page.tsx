'use client';
import { useState } from 'react';
import { gridToLatLon, latLonToGrid, gridDistanceBearing } from '@/lib/tools/satellites';
import { PageHeader } from '@/components/page-header';
import { Card, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Result } from '@/components/calc-field';

const COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
const bearingLabel = (d: number) => `${COMPASS[Math.round(d / 45) % 8]} (${Math.round(d)}°)`;

export default function GridPage() {
  const [grid, setGrid] = useState('FN31pr');
  const [lat, setLat] = useState('40.71');
  const [lon, setLon] = useState('-74.01');
  const [from, setFrom] = useState('FN31pr');
  const [to, setTo] = useState('IO91wm');

  const ll = gridToLatLon(grid);
  const gridFromLL =
    !Number.isNaN(parseFloat(lat)) && !Number.isNaN(parseFloat(lon))
      ? latLonToGrid(parseFloat(lat), parseFloat(lon))
      : null;
  const db = gridDistanceBearing(from, to);

  return (
    <div>
      <PageHeader title="Maidenhead grid tools" description="Convert between grid squares and coordinates, and find distance/bearing." />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle className="mb-3">Grid → lat/lon</CardTitle>
          <label htmlFor="g" className="mb-1 block text-sm font-medium">Grid square</label>
          <Input id="g" value={grid} onChange={(e) => setGrid(e.target.value)} className="font-mono" placeholder="FN31pr" />
          <div className="mt-3">
            {ll ? (
              <Result label="Coordinates" value={`${ll.lat.toFixed(4)}, ${ll.lon.toFixed(4)}`} />
            ) : (
              <p className="text-sm text-muted">Enter a 4- or 6-character grid (e.g. FN31 or FN31pr).</p>
            )}
          </div>
        </Card>

        <Card>
          <CardTitle className="mb-3">Lat/lon → grid</CardTitle>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="la" className="mb-1 block text-sm font-medium">Latitude</label>
              <Input id="la" value={lat} onChange={(e) => setLat(e.target.value)} className="font-mono" />
            </div>
            <div>
              <label htmlFor="lo" className="mb-1 block text-sm font-medium">Longitude</label>
              <Input id="lo" value={lon} onChange={(e) => setLon(e.target.value)} className="font-mono" />
            </div>
          </div>
          <div className="mt-3">
            {gridFromLL ? <Result label="Grid square" value={gridFromLL} /> : <p className="text-sm text-muted">Enter numeric coordinates.</p>}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardTitle className="mb-3">Distance & bearing between grids</CardTitle>
          <div className="grid grid-cols-2 gap-3 sm:max-w-md">
            <div>
              <label htmlFor="from" className="mb-1 block text-sm font-medium">From</label>
              <Input id="from" value={from} onChange={(e) => setFrom(e.target.value)} className="font-mono" />
            </div>
            <div>
              <label htmlFor="to" className="mb-1 block text-sm font-medium">To</label>
              <Input id="to" value={to} onChange={(e) => setTo(e.target.value)} className="font-mono" />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:max-w-md">
            {db ? (
              <>
                <Result label="Distance" value={db.distanceKm.toFixed(0)} unit="km" />
                <Result label="Bearing" value={bearingLabel(db.bearingDeg)} />
              </>
            ) : (
              <p className="text-sm text-muted">Enter two valid grid squares.</p>
            )}
          </div>
          {db ? <p className="mt-2 text-xs text-muted">{(db.distanceKm * 0.621371).toFixed(0)} miles · great-circle initial bearing.</p> : null}
        </Card>
      </div>
    </div>
  );
}
