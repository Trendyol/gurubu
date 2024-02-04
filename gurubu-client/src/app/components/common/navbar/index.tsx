"use client";
import Image from "next/image";
import Logo from "../logo";
import NavbarLinks from "./links";
import { useCallback, useState } from "react";
import MobileMenu from "./mobileMenu";

const Navbar = () => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const toggleMobileNavHandler = useCallback(() => {
    setIsMobileNavOpen((prevState) => !prevState);
  }, []);

  return (
    <nav className="nav">
      <div className="nav__content">
        <Logo />
        <NavbarLinks />
        <button
          onClick={toggleMobileNavHandler}
          className="nav__content-hamburger"
        >
          <Image src="./hamburger.svg" alt="hamburger" width={24} height={24} />
        </button>
      </div>
      {isMobileNavOpen && <MobileMenu onLinkClick={toggleMobileNavHandler} />}
    </nav>
  );
};

export default Navbar;
