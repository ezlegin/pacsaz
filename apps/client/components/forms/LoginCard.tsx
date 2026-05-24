import { loginPic } from "@/public";
import { Card } from "@repo/ui/components/card";
import Image from "next/image";
import Link from "next/link";
import PacsazLogo from "../PacsazLogo";
import LoginForm from "./login/LoginForm";

const LoginCard = () => {
  return (
    <Card className="p-0 flex-row justify-between overflow-hidden gap-0 z-10 w-full max-w-2xl">
      <div className="p-8 pr-5 w-3/5 flex flex-col justify-between">
        <div className="space-y-3">
          <div>
            <Link href={"/"}>
              <PacsazLogo />
            </Link>
          </div>
          <h1 className="font-semibold text-2xl">ورود به حساب کاربری</h1>
          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
            <li>مدیریت اشتراک</li>
            <li>ذخیره قالب های دلخواه</li>
            <li>ویراش مشخصات شخصی</li>
          </ul>
        </div>

        <LoginForm />
      </div>

      <Image
        alt=""
        src={loginPic}
        width={268}
        height={441}
        className="h-full w-2/5"
      />
    </Card>
  );
};

export default LoginCard;
