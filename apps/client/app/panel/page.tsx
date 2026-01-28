import PanelDashboard from "@/app/panel/components/PanelDashboard";
import SubscriptionList from "@/components/SubscriptionList";
import { isSubscribed } from "@repo/store/app/user.store";

const Page = async () => {
  const isUserSubscribed = await isSubscribed;

  return !isUserSubscribed ? <SubscriptionList /> : <PanelDashboard />;
};

export default Page;
