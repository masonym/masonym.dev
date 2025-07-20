import BossesPageClient from './components/BossesPageClient';

export const metadata = {
  title: "Boss Data | mason's maple matrix",
  description: "A tool to check various boss data, such as HP values, IED requirements, Arcane Force and Sacred Power requirements, and more.",
};

export default function BossesPage() {
  return <BossesPageClient />;
}
