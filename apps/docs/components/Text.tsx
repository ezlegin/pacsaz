import { cn } from "@repo/ui/lib/utils";
import Link from "next/link";
import React, { ReactNode } from "react";

export const Title = ({
  children,
  size = "lg",
}: {
  children: ReactNode;
  size?: "md" | "lg" | "sm";
}) => {
  return (
    <h2
      className={cn(
        size === "lg" ? "text-2xl" : size === "md" ? "text-xl" : "text-lg",
        "font-medium text-primary-foreground",
      )}
    >
      {children}
    </h2>
  );
};

export const P = ({ children }: { children: ReactNode }) => {
  return <div className="text-muted-foreground leading-6">{children}</div>;
};

export const PGroup = ({ children }: { children: ReactNode }) => {
  return <div className="space-y-4">{children}</div>;
};

export const HL = ({
  children,
  isProp,
}: {
  children: ReactNode;
  isProp?: boolean;
}) => {
  return (
    <span
      className={cn(
        isProp ? "bg-yellow-500/20" : "bg-white/15",
        "text-primary-foreground  py-0.5 px-1.5 rounded-sm mx-0.5",
      )}
    >
      {children}
    </span>
  );
};

export const Note = ({ children }: { children: ReactNode }) => {
  return (
    <span className="text-primary-foreground rounded-sm mx-0.5 flex gap-5 items-center">
      <div className="w-1 h-8 bg-primary/80" />
      {children}
    </span>
  );
};

export const LNK = ({
  children,
  href,
}: {
  children: ReactNode;
  href: string;
}) => {
  return (
    <span>
      <Link className="underline text-primary" href={href}>
        {children}
      </Link>
    </span>
  );
};

export const Section = ({
  children,
  title,
  titleSize = "lg",
}: {
  children: ReactNode;
  title: string;
  titleSize?: "sm" | "lg" | "md";
}) => {
  return (
    <div>
      <Title size={titleSize}>{title}</Title>
      <div className="space-y-10">{children}</div>
    </div>
  );
};

export const SectionGroup = ({ children }: { children: ReactNode }) => {
  return <div className="space-y-20">{children}</div>;
};

export const List = ({ children }: { children: ReactNode }) => {
  return <div className="space-y-1 pl-5">{children}</div>;
};

export const ListItem = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex gap-4 items-center">
      <div className="text-2xl">•</div>
      <div>{children}</div>
    </div>
  );
};
