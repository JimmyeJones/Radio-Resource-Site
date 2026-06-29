'use client';
import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardTitle } from '@/components/ui/card';
import { CalcField, Result } from '@/components/calc-field';
import { dbiToDbd, dbdToDbi, erpWatts, eirpWatts, DIPOLE_DBI } from '@/lib/tools/rf';

export default function GainPage() {
  const [dbi, setDbi] = useState(2.15);
  const [tx, setTx] = useState(100);
  const [gainDbd, setGainDbd] = useState(6);
  const [loss, setLoss] = useState(1);

  const erp = erpWatts(tx, gainDbd, loss);
  const eirp = eirpWatts(tx, dbdToDbi(gainDbd), loss);

  return (
    <div>
      <PageHeader title="Gain & ERP / EIRP" description="Convert between dBi and dBd, and compute effective radiated power." />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle className="mb-3">dBi ↔ dBd</CardTitle>
          <div className="max-w-xs">
            <CalcField id="dbi" label="Gain" unit="dBi" value={dbi} onChange={setDbi} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Result label="In dBd" value={dbiToDbd(dbi).toFixed(2)} unit="dBd" />
            <Result label="vs dipole" value={(dbi - DIPOLE_DBI).toFixed(2)} unit="dB" />
          </div>
          <p className="mt-2 text-xs text-muted">A ½λ dipole = {DIPOLE_DBI} dBi = 0 dBd.</p>
        </Card>

        <Card>
          <CardTitle className="mb-3">ERP / EIRP</CardTitle>
          <div className="grid grid-cols-3 gap-3">
            <CalcField id="tx" label="TX power" unit="W" value={tx} onChange={setTx} min={0} />
            <CalcField id="g" label="Antenna gain" unit="dBd" value={gainDbd} onChange={setGainDbd} />
            <CalcField id="l" label="Feedline loss" unit="dB" value={loss} onChange={setLoss} min={0} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Result label="ERP" value={erp >= 1000 ? `${(erp / 1000).toFixed(2)} kW` : `${erp.toFixed(0)} W`} />
            <Result label="EIRP" value={eirp >= 1000 ? `${(eirp / 1000).toFixed(2)} kW` : `${eirp.toFixed(0)} W`} />
          </div>
          <p className="mt-2 text-xs text-muted">ERP is dipole-referenced; EIRP is isotropic-referenced (≈ 2.15 dB higher).</p>
        </Card>
      </div>
    </div>
  );
}
