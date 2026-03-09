import { ISpec } from "@repo/store/editor/dielineSpec.store";
import { UseFormReturn } from "react-hook-form";
import PropsFormContent from "../shapes/PropsFormContent";

interface Props {
  form: UseFormReturn<ISpec.DoorSpec, any, ISpec.DoorSpec>;
}

const SnapLockProps = ({}: Props) => {
  return (
    <PropsFormContent>
      <div />
    </PropsFormContent>
  );
};

export default SnapLockProps;
