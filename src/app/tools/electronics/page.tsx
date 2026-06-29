'use client';
import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardTitle } from '@/components/ui/card';
import { Input, Select } from '@/components/ui/input';
import { CalcField, Result } from '@/components/calc-field';
import {
  RESISTOR_COLORS,
  decodeResistor,
  decodeCapCode,
  decodeSmdResistor,
  ohmsLaw,
  ledResistor,
  rcCutoffHz,
  lcResonanceHz,
  voltageDivider,
  timer555Astable,
  timer555Monostable,
  formatOhms,
  formatFarads,
  formatHz,
} from '@/lib/tools/electronics';

const SWATCH: Record<string, string> = {
  black: '#000', brown: '#7a4a17', red: '#d22', orange: '#e80', yellow: '#fd0',
  green: '#0a6', blue: '#06c', violet: '#85d', grey: '#888', white: '#fff',
  gold: '#caa14a', silver: '#bbb',
};

export default function ElectronicsPage() {
  const [bands, setBands] = useState(['brown', 'black', 'red', 'gold']);
  const res = decodeResistor(bands);

  const [capCode, setCapCode] = useState('104');
  const cap = decodeCapCode(capCode);

  const [smd, setSmd] = useState('472');
  const smdR = decodeSmdResistor(smd);

  const [ov, setOv] = useState(5);
  const [oi, setOi] = useState(0.02);
  const ohm = ohmsLaw({ v: ov, i: oi });

  const [supply, setSupply] = useState(5);
  const [vf, setVf] = useState(2.0);
  const [ma, setMa] = useState(20);

  const [rcR, setRcR] = useState(10000);
  const [rcC, setRcC] = useState(1e-7);

  const [lcL, setLcL] = useState(1e-6);
  const [lcC, setLcC] = useState(1e-10);

  const [vdIn, setVdIn] = useState(12);
  const [vdR1, setVdR1] = useState(10000);
  const [vdR2, setVdR2] = useState(4700);

  const [t1, setT1] = useState(10000);
  const [t2, setT2] = useState(47000);
  const [tc, setTc] = useState(1e-7);
  const astable = timer555Astable(t1, t2, tc);

  return (
    <div>
      <PageHeader title="Electronics calculators" description="Resistor & capacitor codes, Ohm's law, filters, dividers, and the 555." />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle className="mb-3">Resistor color code</CardTitle>
          <div className="mb-3 flex flex-wrap gap-2">
            {bands.map((b, i) => (
              <div key={i}>
                <label htmlFor={`band-${i}`} className="mb-1 block text-xs text-muted">
                  {i < bands.length - 2 ? `Digit ${i + 1}` : i === bands.length - 2 ? 'Mult' : 'Tol'}
                </label>
                <Select
                  id={`band-${i}`}
                  value={b}
                  onChange={(e) => setBands((bs) => bs.map((x, j) => (j === i ? e.target.value : x)))}
                  className="w-24"
                >
                  {(i === bands.length - 1
                    ? ['brown', 'red', 'green', 'blue', 'violet', 'grey', 'gold', 'silver']
                    : i === bands.length - 2
                      ? [...RESISTOR_COLORS, 'gold', 'silver']
                      : RESISTOR_COLORS
                  ).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </Select>
              </div>
            ))}
            <div className="flex items-end">
              <button
                type="button"
                className="h-10 rounded-md border border-border px-3 text-sm hover:bg-elevated"
                onClick={() => setBands((bs) => (bs.length === 4 ? ['brown', 'black', 'black', 'red', 'gold'] : ['brown', 'black', 'red', 'gold']))}
              >
                {bands.length === 4 ? '5-band' : '4-band'}
              </button>
            </div>
          </div>
          <div className="mb-3 flex gap-1">
            {bands.map((b, i) => (
              <span key={i} className="h-8 w-4 rounded-sm border border-border" style={{ background: SWATCH[b] ?? '#888' }} aria-hidden />
            ))}
          </div>
          <Result label="Resistance" value={res ? `${formatOhms(res.ohms)} ±${res.tolerance}%` : 'invalid'} />
        </Card>

        <Card>
          <CardTitle className="mb-3">Code decoders</CardTitle>
          <div className="space-y-3">
            <div>
              <label htmlFor="capcode" className="mb-1 block text-sm font-medium">Capacitor code</label>
              <Input id="capcode" value={capCode} onChange={(e) => setCapCode(e.target.value)} placeholder="104" className="font-mono" />
              <p className="mt-1 text-sm text-muted">{cap != null ? formatFarads(cap) : 'enter a 2–3 digit code'}</p>
            </div>
            <div>
              <label htmlFor="smdcode" className="mb-1 block text-sm font-medium">SMD resistor code</label>
              <Input id="smdcode" value={smd} onChange={(e) => setSmd(e.target.value)} placeholder="472 / 4R7 / 01C" className="font-mono" />
              <p className="mt-1 text-sm text-muted">{smdR != null ? formatOhms(smdR) : 'enter a 3/4-digit, R, or EIA-96 code'}</p>
            </div>
          </div>
        </Card>

        <Card>
          <CardTitle className="mb-3">Ohm&apos;s law</CardTitle>
          <div className="grid grid-cols-2 gap-3">
            <CalcField id="ov" label="Voltage" unit="V" value={ov} onChange={setOv} />
            <CalcField id="oi" label="Current" unit="A" value={oi} onChange={setOi} />
          </div>
          {ohm ? (
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Result label="Resistance" value={formatOhms(ohm.r)} />
              <Result label="Power" value={`${ohm.p.toFixed(3)} W`} />
            </div>
          ) : null}
          <p className="mt-2 text-xs text-muted">Enter voltage and current to solve for R and P.</p>
        </Card>

        <Card>
          <CardTitle className="mb-3">LED series resistor</CardTitle>
          <div className="grid grid-cols-3 gap-3">
            <CalcField id="sup" label="Supply" unit="V" value={supply} onChange={setSupply} />
            <CalcField id="vf" label="LED Vf" unit="V" value={vf} onChange={setVf} />
            <CalcField id="ma" label="Current" unit="mA" value={ma} onChange={setMa} />
          </div>
          <div className="mt-3">
            <Result label="Resistor" value={formatOhms(ledResistor(supply, vf, ma))} />
          </div>
        </Card>

        <Card>
          <CardTitle className="mb-3">RC low-pass & LC resonance</CardTitle>
          <div className="grid grid-cols-2 gap-3">
            <CalcField id="rcr" label="R" unit="Ω" value={rcR} onChange={setRcR} />
            <CalcField id="rcc" label="C" unit="F" value={rcC} onChange={setRcC} />
          </div>
          <div className="mt-2"><Result label="RC cutoff" value={formatHz(rcCutoffHz(rcR, rcC))} /></div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <CalcField id="lcl" label="L" unit="H" value={lcL} onChange={setLcL} />
            <CalcField id="lcc" label="C" unit="F" value={lcC} onChange={setLcC} />
          </div>
          <div className="mt-2"><Result label="LC resonance" value={formatHz(lcResonanceHz(lcL, lcC))} /></div>
        </Card>

        <Card>
          <CardTitle className="mb-3">Voltage divider</CardTitle>
          <div className="grid grid-cols-3 gap-3">
            <CalcField id="vin" label="Vin" unit="V" value={vdIn} onChange={setVdIn} />
            <CalcField id="r1" label="R1" unit="Ω" value={vdR1} onChange={setVdR1} />
            <CalcField id="r2" label="R2" unit="Ω" value={vdR2} onChange={setVdR2} />
          </div>
          <div className="mt-3"><Result label="Vout" value={`${voltageDivider(vdIn, vdR1, vdR2).toFixed(3)} V`} /></div>
        </Card>

        <Card>
          <CardTitle className="mb-3">555 astable</CardTitle>
          <div className="grid grid-cols-3 gap-3">
            <CalcField id="t1" label="R1" unit="Ω" value={t1} onChange={setT1} />
            <CalcField id="t2" label="R2" unit="Ω" value={t2} onChange={setT2} />
            <CalcField id="tc" label="C" unit="F" value={tc} onChange={setTc} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Result label="Frequency" value={formatHz(astable.freqHz)} />
            <Result label="Duty cycle" value={`${astable.dutyPct.toFixed(1)} %`} />
          </div>
          <p className="mt-2 text-xs text-muted">Monostable with R1 &amp; C: {(timer555Monostable(t1, tc) * 1000).toFixed(2)} ms pulse.</p>
        </Card>
      </div>
    </div>
  );
}
