import { UseFormReturn } from "react-hook-form";
import PointInput from "../shapes/PointInput";
import PropsFormContent from "../shapes/PropsFormContent";

interface Props {
  form: UseFormReturn<any, any, any>;
}

const GlueProps = ({ form }: Props) => {
  return (
    <PropsFormContent>
      <PointInput form={form} nameX="from.0" nameY="from.1" label="From" />
      <PointInput form={form} nameX="to.0" nameY="to.1" label="To" />
    </PropsFormContent>
  );
};

export default GlueProps;
