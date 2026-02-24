import { useDielineSpecStore } from "@repo/store/dieline/dielineSpec.store";

const DielineLayer = () => {
  const { dielineSpec } = useDielineSpecStore();

  return (
    <div>
      <div>slug: {dielineSpec.slug}</div>
      <div>Title: {dielineSpec.title}</div>
      <div>.</div>
      <span className="font-medium">Layers</span>
    </div>
  );
};

export default DielineLayer;
