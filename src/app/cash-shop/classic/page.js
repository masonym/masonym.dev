import AdvancedItemList from "../components/AdvancedItemList";

export const metadata = {
  title: "Classic World Cash Shop | mason's maple matrix",
  description:
    "Upcoming, current & past Cash Shop sales in MapleStory Classic World.",
};

const page = () => {
  return <AdvancedItemList shopId="classic" />;
};

export default page;
