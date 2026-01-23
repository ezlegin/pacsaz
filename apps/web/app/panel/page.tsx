import PanelDashboard from "@/components/PanelDashboard";
import SubscriptionList from "@/components/SubscriptionList";
import { isUserSubscribed } from "@/data/user";

const Page = async () => {
  const isUserSubscribed = await isUserSubscribed;

  return !isUserSubscribed ? <SubscriptionList /> : <PanelDashboard />;
};

export default Page;
