// Lives in the app rather than @repo/ui: it imports next/link, and Next.js
// imports inside the shared UI package make Vercel treat packages/ui as a
// deployable service. PopupNewDialog depends on it, so both moved together.
import { Button } from "@repo/ui/components/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { ComponentProps } from "react";

/**
 * Without `href` this is a plain button and passes its props on, so it can sit
 * under a Radix `asChild` trigger (which hands it `onClick`, `aria-*`, a ref).
 * It used to always render a Link to "", which swallowed those props.
 */
const NewButton = ({
  href,
  title = "New",
  className,
  icon = true,
  ...props
}: {
  href?: string;
  title?: string;
  className?: string;
  icon?: boolean;
} & Omit<ComponentProps<typeof Button>, "title">) => {
  const content = (
    <>
      {icon && <Plus />}
      {title}
    </>
  );

  if (href)
    return (
      <Button asChild className={className}>
        <Link href={href}>{content}</Link>
      </Button>
    );

  return (
    <Button className={className} {...props}>
      {content}
    </Button>
  );
};

export default NewButton;
