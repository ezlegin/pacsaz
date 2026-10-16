import { getSessionUser } from "@repo/auth/session";
import { Dieline, prisma } from "@repo/db";
import { ChevronLeft, Search } from "lucide-react";
import Link from "next/link";
import PacsazLogo from "../PacsazLogo";
import FavoriteDieline from "../product/FavoriteDielineButton";
import NavbarButtons from "./NavbarButtons";

interface Props {
  dieline: Dieline;
}

const DielineNavbar = async ({ dieline }: Props) => {
  const user = await getSessionUser();
  const favedDieline = await prisma.favedDieline.findFirst({
    where: { AND: [{ userId: user?.id }, { dielineId: dieline.id }] },
  });

  return (
    <header className="relative z-30 shrink-0 border-b bg-background/80 px-4 py-3 backdrop-blur md:px-6">
      <div className="flex items-center justify-between gap-4">
        {/* ----------------------------- breadcrumb ---------------------------- */}
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/"
            className="shrink-0 transition-opacity hover:opacity-80"
            aria-label="صفحه اصلی پک‌ساز"
          >
            <PacsazLogo />
          </Link>

          <span aria-hidden className="h-6 w-px shrink-0 bg-border" />

          <nav className="flex min-w-0 items-center gap-2 text-xs">
            <Link
              href="/dielines"
              className="shrink-0 rounded-lg px-2 py-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              دایلاین‌ها
            </Link>

            <ChevronLeft className="size-3.5 shrink-0 text-muted-foreground/60" />

            <span className="flex min-w-0 items-center gap-2 rounded-lg bg-primary/10 px-2.5 py-1 font-bold text-primary">
              <span className="truncate">{dieline.title}</span>
            </span>

            <FavoriteDieline
              isFaved={!!favedDieline}
              dielineId={dieline.id}
              user={user}
            />
          </nav>
        </div>

        {/* ------------------------------ utilities ---------------------------- */}
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/dielines"
            className="hidden items-center gap-1.5 rounded-xl border bg-background px-3 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary md:inline-flex"
          >
            <Search className="size-3.5" />
            قالب دیگری انتخاب کنم
          </Link>

          <NavbarButtons />
        </div>
      </div>
    </header>
  );
};

export default DielineNavbar;
