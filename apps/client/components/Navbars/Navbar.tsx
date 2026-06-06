import Link from "next/link";
import NavbarButtons from "./NavbarButtons";
import PacsazLogo from "../PacsazLogo";

export const layoutPaddings = "p-3 px-10";

const Navbar = () => {
  return (
    <div
      className={`flex justify-between items-center border-b bg-background z-10 ${layoutPaddings}`}
    >
      <div className="flex gap-10 items-center">
        <Link href={"/"}>
          <PacsazLogo type="full" />
        </Link>

        <div className="flex gap-12">
          {navbarMenu.map((item, idx) => (
            <Link href={item.href} key={idx} className="relative group">
              <button className="cursor-pointer font-medium text-sm">
                {item.label}
              </button>

              <div className="w-full h-px bg-accent-foreground absolute -bottom-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </Link>
          ))}
        </div>
      </div>
      <NavbarButtons />
    </div>
  );
};

export default Navbar;

const navbarMenu = [
  { label: "قالب ها", href: "/dielines" },
  { label: "درباره ما", href: "/about-us" },
  { label: "آموزش", href: "https://igraphical.ir/courses/packaging" },
];
