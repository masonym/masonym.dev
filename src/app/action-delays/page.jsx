import ActionDelaysClient from './components/ActionDelaysClient';

export const metadata = {
  title: "Action Delays | mason's maple matrix",
  description: "A tool to view skill action delays at different attack speed stages in MapleStory.",
};

export default function ActionDelaysPage() {
  return <ActionDelaysClient />;
}
