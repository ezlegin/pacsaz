import LoginForm from "@/components/forms/LoginForm";

const page = () => {
  return (
    <div className="bg-accent h-screen overflow-hidden flex  items-center justify-center ">
      <div
        className={`
      absolute inset-0 
      bg-[url('/pacsaz-pattern.png')]
      bg-[length:800px]
      bg-repeat
      opacity-20
      pointer-events-none
    `}
      />
      <LoginForm />
    </div>
  );
};

export default page;
