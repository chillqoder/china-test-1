import { countries } from '@/data/countries';
import DashboardClient from './DashboardClient';

export default function DashboardPage() {
  return <DashboardClient countries={countries} />;
}
