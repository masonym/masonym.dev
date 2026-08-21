import { Suspense } from 'react';
import BurningFieldClient from './components/BurningFieldClient';
import { AuthProvider } from './components/AuthProvider';

export const metadata = {
  title: "Burning Field Tracker | mason's maple matrix",
  description:
    'Track Burning Field levels across every channel of your world with your training group. Log readings, project levels forward, and find the best channel to hop to.',
};

export default function BurningFieldPage() {
  return (
    <AuthProvider>
      <Suspense fallback={null}>
        <BurningFieldClient />
      </Suspense>
    </AuthProvider>
  );
}
