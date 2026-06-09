import EventRewardsList from "./components/EventRewardsList";
import events from "./data/event_rewards.json";

export const metadata = {
    title: "Event Rewards | mason's maple matrix",
    description: "Reward slots extracted from in-game event windows.",
};

const Page = () => {
    return <EventRewardsList events={events} />;
};

export default Page;
