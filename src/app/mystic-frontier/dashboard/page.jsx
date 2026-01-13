import DashboardClient from './DashboardClient';

export const metadata = {
  title: "Mystic Frontier Dashboard | mason's maple matrix",
  description: "View aggregated Mystic Frontier expedition statistics, reward drop rates, and tile analytics.",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
