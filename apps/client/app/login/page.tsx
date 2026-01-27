import LoginPopup from "@/components/forms/LoginPopup";
import PacsazBGPattern from "@/components/PacsazBGPattern";

const page = () => {
  return (
    <PacsazBGPattern className="flex justify-center items-center">
      <LoginPopup />
    </PacsazBGPattern>
  );
};

export default page;
