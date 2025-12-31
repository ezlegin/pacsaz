import Link from "next/link";
import NavbarButtons from "./NavbarButtons";
import PacsazLogo from "./PacsazLogo";

export const navbarPaddings = "p-3 px-10";

const Navbar = () => {
  return (
    <div
      className={`flex justify-between items-center border-b ${navbarPaddings}`}
    >
      <div className="flex gap-10 items-center">
        <Link href={"/"}>
          <PacsazLogo type="full" />
        </Link>

        <div className="flex gap-12">
          {navbarMenu.map((item, idx) => (
            <div key={idx} className="relative group">
              <button className="cursor-pointer font-medium text-sm">
                {item.label}
              </button>

              <div className="w-full h-[1px] bg-accent-foreground absolute -bottom-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          ))}
        </div>
      </div>
      <NavbarButtons />
    </div>
  );
};

export default Navbar;

const navbarMenu = [
  { label: "قالب ها", href: "" },
  { label: "آموزش", href: "" },
  { label: "درباره ما", href: "" },
];
