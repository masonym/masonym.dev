import MysticFrontierClient from './components/MysticFrontierClient';
import { AuthProvider } from './components/AuthProvider';

export const metadata = {
  title: "Mystic Frontier Tracker | mason's maple matrix",
  description: "Track and analyze your Mystic Frontier expedition data. Log tiles, rewards, and view community statistics.",
};

export default function MysticFrontierPage() {
  return (
    <AuthProvider>
      <MysticFrontierClient />
    </AuthProvider>
  );
}
