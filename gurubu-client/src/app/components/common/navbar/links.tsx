import Link from "next/link";
import { navbarLinks } from "../constants";
import classNames from "classnames";

type Props = {
  inMobileNavbar?: boolean;
  onLinkClick?: () => void;
};

const NavbarLinks = ({ inMobileNavbar, onLinkClick }: Props) => {
  return (
    <div
      className={classNames("nav__content--links", {
        "--mobile": inMobileNavbar,
      })}
    >
      {navbarLinks.map((link) => {
        return (
          <Link
            href={link.href}
            key={link.href}
            className="nav__content--links__link"
            onClick={inMobileNavbar ? onLinkClick : undefined}
          >
            {link.name}
          </Link>
        );
      })}
    </div>
  );
};

export default NavbarLinks;
