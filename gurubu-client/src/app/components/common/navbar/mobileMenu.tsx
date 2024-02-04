import Logo from "../logo";
import NavbarLinks from "./links";
import { IconX } from "@tabler/icons-react";

type Props = {
  onLinkClick: () => void;
};

const MobileMenu = ({ onLinkClick }: Props) => {
  return (
    <div className="mobile-nav">
      <button className="mobile-nav__close" onClick={onLinkClick}>
        <IconX size={24} />
      </button>
      <div className="mobile-nav__content">
        <Logo />
        <NavbarLinks inMobileNavbar onLinkClick={onLinkClick} />
      </div>
    </div>
  );
};

export default MobileMenu;
