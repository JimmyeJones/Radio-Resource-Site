import type { Metadata } from 'next';
import { SetupWizard } from '@/components/setup-wizard';

export const metadata: Metadata = { title: 'Setup' };
export const dynamic = 'force-dynamic';

export default function SetupPage() {
  return <SetupWizard />;
}
