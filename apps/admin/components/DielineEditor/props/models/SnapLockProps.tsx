import { UseFormReturn } from "react-hook-form";
import PropsFormContent from "../shapes/PropsFormContent";
import { ISpec } from "@repo/store/types";

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
