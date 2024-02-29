import Image from "next/image";
import Link from "next/link";
import { footerLinks } from "./constants";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__container__links">
          {footerLinks.map((link) => {
            return (
              <Link href={link.href} key={link.href}>
                {link.name}
              </Link>
            );
          })}
        </div>
        <p className="footer__container__copyright">© 2024 GuruBu</p>
      </div>
      <div className="footer__logo">
        <Image priority src="/logo.svg" alt="logo" width={24} height={24} />
        <p>GuruBu</p>
      </div>
    </footer>
  );
};

export default Footer;
