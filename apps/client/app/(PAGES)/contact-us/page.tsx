import PageTitle from "@/components/PageTitle";

const page = async () => {
  return (
    <div>
      <div className="flex flex-col text-center">
        <PageTitle
          title="تماس با ما"
          subTitle="برای ارتباط با پک ساز، می توانید از طریق راه های زیر اقدام نمایید."
        />

        <div className="pt-2">
          <p className="font-medium">ایمیل پک ساز</p>
          <a href="mailto:pacsaz.ir@gmail.com" className="text-primary">
            pacsaz.ir@gmail.com
          </a>
        </div>
        <div className="pt-2">
          <p className="font-medium">شماره تماس پک ساز</p>
          <a href="tel:09962224177" className="text-primary">
            0996-222-4177
          </a>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        پاسخ گویی 9 الی 14 - شنبه تا چهارشنبه
      </p>

      {/* <ContactUsForm user={user} /> */}
    </div>
  );
};

export default page;

export const metadata = {
  title: "تماس با ما",
};
