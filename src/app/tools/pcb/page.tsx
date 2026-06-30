'use client';
import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardTitle } from '@/components/ui/card';
import { CalcField, Result } from '@/components/calc-field';
import {
  ipcWidthMil,
  ipcCurrent,
  milToMm,
  microstripImpedance,
  striplineImpedance,
  viaCurrent,
} from '@/lib/tools/pcb';

export default function PcbToolPage() {
  // Trace width
  const [current, setCurrent] = useState(1);
  const [copperOz, setCopperOz] = useState(1);
  const [tempRise, setTempRise] = useState(10);
  const [external, setExternal] = useState(true);
  const widthMil = ipcWidthMil(current, copperOz, tempRise, external);

  // Width → current (for an existing trace)
  const [traceMil, setTraceMil] = useState(20);
  const cap = ipcCurrent(traceMil, copperOz, tempRise, external);

  // Microstrip
  const [msW, setMsW] = useState(0.3);
  const [msH, setMsH] = useState(0.2);
  const [msT, setMsT] = useState(0.035);
  const [er, setEr] = useState(4.3);

  // Stripline
  const [slW, setSlW] = useState(0.2);
  const [slB, setSlB] = useState(0.5);

  // Via
  const [viaD, setViaD] = useState(0.3);
  const [plating, setPlating] = useState(25);

  return (
    <div>
      <PageHeader
        title="PCB calculator"
        description="IPC-2221 trace current, controlled-impedance microstrip/stripline, and via capacity."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle className="mb-3">Trace width for current (IPC-2221)</CardTitle>
          <div className="grid grid-cols-2 gap-3">
            <CalcField id="cur" label="Current" unit="A" value={current} onChange={setCurrent} min={0} />
            <CalcField id="cu" label="Copper weight" unit="oz" value={copperOz} onChange={setCopperOz} step={0.5} min={0.5} />
            <CalcField id="dt" label="Temp rise" unit="°C" value={tempRise} onChange={setTempRise} min={1} />
            <div className="flex items-end">
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" className="h-4 w-4 accent-accent" checked={external} onChange={(e) => setExternal(e.target.checked)} />
                External layer
              </label>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Result label="Min width" value={widthMil.toFixed(1)} unit="mil" />
            <Result label="Min width" value={milToMm(widthMil).toFixed(3)} unit="mm" />
          </div>
        </Card>

        <Card>
          <CardTitle className="mb-3">Current capacity of a trace</CardTitle>
          <div className="max-w-xs">
            <CalcField id="tw" label="Trace width" unit="mil" value={traceMil} onChange={setTraceMil} min={1} />
          </div>
          <div className="mt-4">
            <Result label={`Max current (${copperOz} oz, ${tempRise} °C rise, ${external ? 'external' : 'internal'})`} value={cap.toFixed(2)} unit="A" />
          </div>
          <p className="mt-3 text-xs text-muted">Uses the copper weight, temp rise, and layer setting from the panel on the left.</p>
        </Card>

        <Card>
          <CardTitle className="mb-3">Microstrip impedance</CardTitle>
          <div className="grid grid-cols-2 gap-3">
            <CalcField id="msw" label="Trace width w" unit="mm" value={msW} onChange={setMsW} min={0.01} />
            <CalcField id="msh" label="Dielectric h" unit="mm" value={msH} onChange={setMsH} min={0.01} />
            <CalcField id="mst" label="Copper t" unit="mm" value={msT} onChange={setMsT} step={0.005} min={0.001} />
            <CalcField id="er1" label="εr" value={er} onChange={setEr} step={0.1} min={1} />
          </div>
          <div className="mt-4">
            <Result label="Z₀" value={microstripImpedance(msW, msH, msT, er).toFixed(1)} unit="Ω" />
          </div>
        </Card>

        <Card>
          <CardTitle className="mb-3">Stripline impedance</CardTitle>
          <div className="grid grid-cols-2 gap-3">
            <CalcField id="slw" label="Trace width w" unit="mm" value={slW} onChange={setSlW} min={0.01} />
            <CalcField id="slb" label="Plane spacing b" unit="mm" value={slB} onChange={setSlB} min={0.02} />
            <CalcField id="slt" label="Copper t" unit="mm" value={msT} onChange={setMsT} step={0.005} min={0.001} />
            <CalcField id="er2" label="εr" value={er} onChange={setEr} step={0.1} min={1} />
          </div>
          <div className="mt-4">
            <Result label="Z₀" value={striplineImpedance(slW, slB, msT, er).toFixed(1)} unit="Ω" />
          </div>
        </Card>

        <Card>
          <CardTitle className="mb-3">Plated via current</CardTitle>
          <div className="grid grid-cols-2 gap-3">
            <CalcField id="viad" label="Via diameter" unit="mm" value={viaD} onChange={setViaD} step={0.05} min={0.1} />
            <CalcField id="plat" label="Plating" unit="µm" value={plating} onChange={setPlating} min={5} />
          </div>
          <div className="mt-4">
            <Result label={`Max current (${tempRise} °C rise)`} value={viaCurrent(viaD, plating, tempRise).toFixed(2)} unit="A" />
          </div>
        </Card>
      </div>

      <p className="mt-6 text-xs text-muted">
        IPC-2221 / IPC-2141 approximations. For controlled impedance and high-current designs, confirm with your fab’s stackup and a field solver.
      </p>
    </div>
  );
}
