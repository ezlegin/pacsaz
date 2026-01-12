import React from "react";
import DielinesList from "./DielinesList";
import Filter from "@/components/Filter";
import Search from "@/components/Search";
import NewButton from "@/components/NewButton";

const page = () => {
  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        <Search placeholder="Search By Slug" />

        <div className="flex gap-3">
          <Filter
            options={[
              { label: "Most Download", value: "most-download" },
              { label: "Less Download", value: "less-download" },
            ]}
            name="download"
            placeholder="Sort By Download"
          />

          <NewButton title="New Dieline" />
        </div>
      </div>

      <DielinesList />
    </div>
  );
};

export default page;
