import { loginPic } from "@/public";
import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Phone } from "lucide-react";
import React from "react";
import PacsazLogo from "../PacsazLogo";
import Image from "next/image";
import Link from "next/link";

const LoginForm = () => {
  return (
    <Card className="p-0 flex-row justify-between overflow-hidden gap-0 z-10 w-full max-w-2xl">
      <div className="p-8 pr-5 w-3/5 flex flex-col justify-between">
        <div className="space-y-3">
          <div>
            <Link href={"/"}>
              <PacsazLogo />
            </Link>
          </div>
          <h1 className="font-semibold text-xl">ورود به حساب کاربری</h1>
          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
            <li>مدیریت اشتراک</li>
            <li>ارتباط با تیم پشتیبانی</li>
            <li>ذخیره قالب های دلخواه</li>
            <li>ویراش مشخصات شخصی</li>
          </ul>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <Input
              placeholder="شماره تماس خود را وارد کنید..."
              className="pr-10 h-10"
            />
            <Phone
              size={18}
              className="text-muted-foreground absolute top-1/2 -translate-y-1/2 right-3"
            />
          </div>
          <Button size={"lg"} disabled className="w-full">
            ارسال کد
          </Button>
        </div>
      </div>

      <Image
        alt=""
        src={loginPic}
        width={300}
        height={300}
        className="h-full w-2/5"
      />
    </Card>
  );
};

export default LoginForm;
