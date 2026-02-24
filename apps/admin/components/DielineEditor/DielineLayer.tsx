import { useDielineSpecStore } from "@repo/store/dieline/dielineSpec.store";

const DielineLayer = () => {
  const { dielineSpec } = useDielineSpecStore();

  const lines = Object.entries(dielineSpec.shapes.line ?? {}).map(
    ([key, item]) => ({
      key,
      item,
    }),
  );

  return (
    <div>
      <div>slug: {dielineSpec.slug}</div>
      <div>Title: {dielineSpec.title}</div>
      <div>.</div>
      <span className="font-medium">Layers</span>
      {lines.map((item, idx) => (
        <div key={idx}>{item.key}</div>
      ))}
    </div>
  );
};

export default DielineLayer;
