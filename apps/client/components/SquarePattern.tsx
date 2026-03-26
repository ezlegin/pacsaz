"use client";

const SquarePattern = () => {
  return (
    <div
      className={`
        absolute inset-0 
        bg-[url('/square-pattern.png')]
        bg-size-[100%]
        bg-no-repeat
        opacity-15
        pointer-events-none
        -z-10
      `}
    />
  );
};

export default SquarePattern;
