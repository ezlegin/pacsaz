import { UseFormReturn } from "react-hook-form";
import PropsFormContent from "../shapes/PropsFormContent";

interface Props {
  form: UseFormReturn<any, any, any>;
}

const SnapLockProps = ({}: Props) => {
  return (
    <PropsFormContent>
      <div />
    </PropsFormContent>
  );
};

export default SnapLockProps;
