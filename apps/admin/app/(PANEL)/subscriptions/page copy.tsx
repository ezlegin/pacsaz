import PageTitle from "@/components/PageTitle";
import Card from "@repo/ui/components/custom/Card";
import { Separator } from "@repo/ui/components/separator";
import React from "react";

const page = () => {
  return (
    <div className="space-y-4">
      <PageTitle title="Subscription Status" />

      <div className="grid grid-cols-3 gap-4">
        <Card primaryTheme>
          <div className="flex justify-between font-medium">
            <span>Active Subscriptions:</span>
            <span>213</span>
          </div>
        </Card>
        <Card>
          <div className="flex justify-between font-medium">
            <span>This Month's Subscriptions:</span>
            <span>213</span>
          </div>
        </Card>
        <Card>
          <div className="flex justify-between font-medium">
            <span>First Subscriptions:</span>
            <span>213</span>
          </div>
        </Card>
        <Card>
          <div className="flex justify-between font-medium">
            <span>Lost Subscriptions:</span>
            <span>213</span>
          </div>
        </Card>
        <Card>
          <div className="flex justify-between font-medium">
            <span>Less than a month to expire:</span>
            <span>213</span>
          </div>
        </Card>
        <Card>
          <div className="flex justify-between font-medium">
            <span>Less than a week to expire:</span>
            <span>213</span>
          </div>
        </Card>
      </div>

      <PageTitle title="Subscription Period" />
      <div className="grid grid-cols-3 gap-4">
        <Card primaryTheme>
          <div className="flex justify-between font-medium">
            <span>Anuual Active Subscriptions:</span>
            <span>213</span>
          </div>
        </Card>

        <Card>
          <div className="flex justify-between font-medium">
            <span>3-month Active Subscriptions:</span>
            <span>213</span>
          </div>
        </Card>

        <Card>
          <div className="flex justify-between font-medium">
            <span>Monthly Active Subscriptions:</span>
            <span>213</span>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default page;
