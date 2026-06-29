import Link from 'next/link';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/page-header';
import { Radio, BookOpen, Compass, Satellite, ChevronRight, AudioLines, CircuitBoard, Antenna, Signal } from 'lucide-react';

const TOOLS = [
  {
    href: '/tools/band-plan',
    title: 'US Amateur Band Plan',
    description: 'Browse 160 m through 23 cm with mode and license-class detail.',
    Icon: Radio,
  },
  {
    href: '/tools/antenna',
    title: 'Antenna & Feed Calculator',
    description: 'Dipole/vertical lengths, dish gain & geometry, waveguide cutoff, coax loss.',
    Icon: Antenna,
  },
  {
    href: '/tools/pcb',
    title: 'PCB Calculator',
    description: 'IPC-2221 trace current, microstrip/stripline impedance, via capacity.',
    Icon: CircuitBoard,
  },
  {
    href: '/tools/link-budget',
    title: 'RF Link Budget',
    description: 'Path loss, link budget, dBm/watt and VSWR/return-loss conversions.',
    Icon: Signal,
  },
  {
    href: '/tools/q-codes',
    title: 'Q-codes',
    description: 'Searchable reference for common amateur Q-signals.',
    Icon: BookOpen,
  },
  {
    href: '/tools/phonetics',
    title: 'NATO Phonetic Alphabet',
    description: 'Look up the table and spell any callsign phonetically.',
    Icon: AudioLines,
  },
  {
    href: '/tools/prefix',
    title: 'Callsign Prefix Lookup',
    description: 'Identify the country and CQ/ITU zones for any callsign.',
    Icon: Compass,
  },
  {
    href: '/tools/satellites',
    title: 'Satellite Pass Predictions',
    description: 'Next passes for the ISS, amateur, and weather satellites at your QTH.',
    Icon: Satellite,
  },
];

export default function ToolsIndex() {
  return (
    <div>
      <PageHeader
        title="Reference tools"
        description="Quick, interactive references that work offline once loaded."
      />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map(({ href, title, description, Icon }) => (
          <li key={href}>
            <Link href={href} className="group block focus:outline-none">
              <Card className="h-full transition-colors group-hover:border-accent group-focus-visible:border-accent">
                <div className="flex items-start gap-3">
                  <span className="rounded-md bg-accent/10 p-2 text-accent">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-1">
                      {title}
                      <ChevronRight
                        className="h-4 w-4 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100"
                        aria-hidden
                      />
                    </CardTitle>
                    <CardDescription className="mt-1">{description}</CardDescription>
                  </div>
                </div>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
