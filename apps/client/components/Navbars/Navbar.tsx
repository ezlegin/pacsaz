import Link from "next/link";
import PacsazLogo from "../PacsazLogo";
import MobileMenu from "./MobileMenu";
import NavbarButtons from "./NavbarButtons";
import NavLinks, { type NavItem } from "./NavLinks";

export const layoutPaddings = "p-3 px-4 md:px-10";

const navItems: NavItem[] = [
  { label: "قالب ها", href: "/dielines" },
  { label: "درباره ما", href: "/about-us" },
  {
    label: "آموزش",
    href: "https://igraphical.ir/courses/packaging",
    external: true,
  },
];

const Navbar = () => {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md">
      {/* desktop */}
      <div
        className={`hidden items-center justify-between md:flex ${layoutPaddings}`}
      >
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="shrink-0 transition-opacity hover:opacity-80"
            aria-label="صفحه اصلی پک‌ساز"
          >
            <PacsazLogo type="full" />
          </Link>

          <NavLinks items={navItems} />
        </div>

        <NavbarButtons />
      </div>

      {/* mobile */}
      <div
        className={`flex items-center justify-between md:hidden ${layoutPaddings}`}
      >
        <Link
          href="/"
          className="shrink-0"
          aria-label="صفحه اصلی پک‌ساز"
        >
          <PacsazLogo type="full" />
        </Link>

        <MobileMenu />
      </div>
    </header>
  );
};

export default Navbar;
