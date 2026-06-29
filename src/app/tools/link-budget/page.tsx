'use client';
import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardTitle } from '@/components/ui/card';
import { CalcField, Result } from '@/components/calc-field';
import {
  fsplDb,
  dbmToWatts,
  wattsToDbm,
  vswrToReturnLossDb,
  vswrToGamma,
  mismatchLossDb,
  linkBudget,
} from '@/lib/tools/rf';

export default function LinkBudgetPage() {
  // Link budget
  const [txDbm, setTxDbm] = useState(37); // 5 W
  const [txGain, setTxGain] = useState(2.1);
  const [txLoss, setTxLoss] = useState(1);
  const [rxGain, setRxGain] = useState(15);
  const [rxLoss, setRxLoss] = useState(1);
  const [dist, setDist] = useState(2000);
  const [freq, setFreq] = useState(435);
  const [extra, setExtra] = useState(3);

  const lb = linkBudget({
    txPowerDbm: txDbm,
    txAntennaGainDbi: txGain,
    txLossDb: txLoss,
    rxAntennaGainDbi: rxGain,
    rxLossDb: rxLoss,
    distanceKm: dist,
    freqMHz: freq,
    extraLossesDb: extra,
  });

  // Converters
  const [watts, setWatts] = useState(5);
  const [dbm, setDbm] = useState(37);
  const [vswr, setVswr] = useState(1.5);

  return (
    <div>
      <PageHeader
        title="RF link budget & converters"
        description="Free-space path loss, end-to-end link budget, and the everyday dBm / VSWR conversions."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle className="mb-3">Link budget</CardTitle>
          <div className="grid grid-cols-2 gap-3">
            <CalcField id="txdbm" label="TX power" unit="dBm" value={txDbm} onChange={setTxDbm} />
            <CalcField id="freq" label="Frequency" unit="MHz" value={freq} onChange={setFreq} min={0} />
            <CalcField id="txg" label="TX antenna gain" unit="dBi" value={txGain} onChange={setTxGain} />
            <CalcField id="txl" label="TX feed loss" unit="dB" value={txLoss} onChange={setTxLoss} />
            <CalcField id="rxg" label="RX antenna gain" unit="dBi" value={rxGain} onChange={setRxGain} />
            <CalcField id="rxl" label="RX feed loss" unit="dB" value={rxLoss} onChange={setRxLoss} />
            <CalcField id="dist" label="Distance" unit="km" value={dist} onChange={setDist} min={0} />
            <CalcField id="extra" label="Other losses" unit="dB" value={extra} onChange={setExtra} />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <Result label="EIRP" value={lb.eirpDbm.toFixed(1)} unit="dBm" />
            <Result label="Path loss" value={lb.fsplDb.toFixed(1)} unit="dB" />
            <Result label="RX power" value={lb.receivedPowerDbm.toFixed(1)} unit="dBm" />
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardTitle className="mb-3">Free-space path loss</CardTitle>
            <p className="text-sm text-muted">
              At {freq} MHz over {dist} km: <strong className="text-fg">{fsplDb(dist, freq).toFixed(1)} dB</strong>
            </p>
          </Card>

          <Card>
            <CardTitle className="mb-3">Power: watts ↔ dBm</CardTitle>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <CalcField id="w" label="Power" unit="W" value={watts} onChange={(v) => { setWatts(v); setDbm(wattsToDbm(v)); }} min={0} />
                <p className="mt-1 text-sm text-muted">= {wattsToDbm(watts).toFixed(2)} dBm</p>
              </div>
              <div>
                <CalcField id="dbm" label="Power" unit="dBm" value={dbm} onChange={(v) => { setDbm(v); setWatts(dbmToWatts(v)); }} />
                <p className="mt-1 text-sm text-muted">= {dbmToWatts(dbm).toFixed(3)} W</p>
              </div>
            </div>
          </Card>

          <Card>
            <CardTitle className="mb-3">VSWR</CardTitle>
            <div className="max-w-xs">
              <CalcField id="vswr" label="VSWR" value={vswr} onChange={setVswr} step={0.05} min={1} />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3">
              <Result label="Return loss" value={vswrToReturnLossDb(vswr).toFixed(2)} unit="dB" />
              <Result label="Reflection Γ" value={vswrToGamma(vswr).toFixed(3)} />
              <Result label="Mismatch loss" value={mismatchLossDb(vswr).toFixed(3)} unit="dB" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
