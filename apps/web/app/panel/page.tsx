import PanelDashboard from "@/components/PanelDashboard";
import SubscriptionList from "@/components/SubscriptionList";
import { isSubscribed } from "@repo/dieline-core/data/consts";

const Page = () => {
  return !isSubscribed ? (
    <div>
      <SubscriptionList />
    </div>
  ) : (
    <PanelDashboard />
  );
};

export default Page;
