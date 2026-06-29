import Link from 'next/link';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/page-header';
import { ChevronRight } from 'lucide-react';
import { TOOL_SECTIONS } from '@/lib/tool-registry';

export default function ToolsIndex() {
  return (
    <div>
      <PageHeader
        title="Reference tools"
        description="Quick, interactive references that work offline once loaded."
      />
      <div className="space-y-10">
        {TOOL_SECTIONS.map((section) => (
          <section key={section.label} aria-labelledby={`sec-${section.label}`}>
            <h2 id={`sec-${section.label}`} className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
              {section.label}
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {section.tools.map(({ href, title, description, Icon }) => (
                <li key={href}>
                  <Link href={href} className="group block focus:outline-none">
                    <Card className="card-glow h-full">
                      <div className="flex items-start gap-3">
                        <span className="rounded-md bg-accent/10 p-2 text-accent">
                          <Icon className="h-5 w-5" aria-hidden />
                        </span>
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-1 text-base">
                            {title}
                            <ChevronRight className="h-4 w-4 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" aria-hidden />
                          </CardTitle>
                          <CardDescription className="mt-1">{description}</CardDescription>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
