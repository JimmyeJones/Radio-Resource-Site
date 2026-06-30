'use client';
import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/input';
import { CalcField, Result } from '@/components/calc-field';
import {
  dipoleLengthM,
  quarterWaveM,
  wavelengthM,
  dishGainDbi,
  dishBeamwidthDeg,
  dishFocalLengthM,
  circularWaveguideCutoffMHz,
  circularWaveguideDiameterMm,
  COAX_CABLES,
  coaxLossDb,
} from '@/lib/tools/antenna';

const m2ft = (m: number) => m / 0.3048;

export default function AntennaToolPage() {
  const [freq, setFreq] = useState(435);
  const [vf, setVf] = useState(0.95);
  const [dishD, setDishD] = useState(1.2);
  const [eff, setEff] = useState(0.55);
  const [fOverD, setFOverD] = useState(0.4);
  const [wgDia, setWgDia] = useState(40);
  const [cable, setCable] = useState(COAX_CABLES[4].name);
  const [runM, setRunM] = useState(15);

  const lambda = wavelengthM(freq);
  const selectedCable = COAX_CABLES.find((c) => c.name === cable) ?? COAX_CABLES[0];
  const loss = coaxLossDb(selectedCable, freq, runM);

  return (
    <div>
      <PageHeader
        title="Antenna & feed calculator"
        description="Dipole/vertical lengths, dish gain and feed geometry, waveguide cutoff, and coax loss."
      />

      <div className="mb-6 max-w-xs">
        <CalcField id="freq" label="Frequency" unit="MHz" value={freq} onChange={setFreq} min={0} />
        <p className="mt-1 text-xs text-muted">λ = {lambda.toFixed(3)} m ({(lambda * 100).toFixed(1)} cm)</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle className="mb-3">Wire antennas</CardTitle>
          <div className="mb-3 max-w-xs">
            <CalcField id="vf" label="Velocity factor" value={vf} onChange={setVf} step={0.01} min={0.5} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Result label="½λ dipole" value={dipoleLengthM(freq).toFixed(3)} unit="m" />
            <Result label="½λ dipole" value={m2ft(dipoleLengthM(freq)).toFixed(2)} unit="ft" />
            <Result label="¼λ vertical" value={quarterWaveM(freq, vf).toFixed(3)} unit="m" />
            <Result label="¼λ vertical" value={m2ft(quarterWaveM(freq, vf)).toFixed(2)} unit="ft" />
          </div>
        </Card>

        <Card>
          <CardTitle className="mb-3">Parabolic dish</CardTitle>
          <div className="mb-3 grid grid-cols-3 gap-3">
            <CalcField id="dishD" label="Diameter" unit="m" value={dishD} onChange={setDishD} min={0.1} />
            <CalcField id="eff" label="Efficiency" value={eff} onChange={setEff} step={0.05} min={0.1} />
            <CalcField id="fod" label="f/D" value={fOverD} onChange={setFOverD} step={0.05} min={0.2} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Result label="Gain" value={dishGainDbi(dishD, freq, eff).toFixed(1)} unit="dBi" />
            <Result label="-3 dB beamwidth" value={dishBeamwidthDeg(dishD, freq).toFixed(1)} unit="°" />
            <Result label="Focal length" value={(dishFocalLengthM(dishD, fOverD) * 100).toFixed(1)} unit="cm" />
          </div>
        </Card>

        <Card>
          <CardTitle className="mb-3">Circular waveguide / feed horn (TE₁₁)</CardTitle>
          <div className="mb-3 max-w-xs">
            <CalcField id="wgDia" label="Inner diameter" unit="mm" value={wgDia} onChange={setWgDia} min={1} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Result label="Cutoff frequency" value={circularWaveguideCutoffMHz(wgDia).toFixed(0)} unit="MHz" />
            <Result
              label="Min diameter @ freq"
              value={circularWaveguideDiameterMm(freq).toFixed(1)}
              unit="mm"
            />
          </div>
          <p className="mt-3 text-xs text-muted">
            The feed must operate above cutoff. As a rule of thumb, size the guide so the operating
            frequency sits ~1.25–1.9× above the TE₁₁ cutoff.
          </p>
        </Card>

        <Card>
          <CardTitle className="mb-3">Coax loss</CardTitle>
          <div className="mb-3 grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="cable" className="mb-1 block text-sm font-medium">Cable</label>
              <Select id="cable" value={cable} onChange={(e) => setCable(e.target.value)}>
                {COAX_CABLES.map((c) => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </Select>
            </div>
            <CalcField id="runM" label="Run length" unit="m" value={runM} onChange={setRunM} min={0} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Result label="Total loss" value={loss.toFixed(2)} unit="dB" />
            <Result label="Power surviving" value={(100 * Math.pow(10, -loss / 10)).toFixed(1)} unit="%" />
          </div>
          <p className="mt-3 text-xs text-muted">VF {selectedCable.velocityFactor} · interpolated from datasheet figures.</p>
        </Card>
      </div>

      <p className="mt-6 text-xs text-muted">
        Approximations for planning. Always trim antennas with an analyzer and verify feed dimensions against your horn design.
      </p>
    </div>
  );
}
