import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__container__links">
          <Link href="/">Overview</Link>
          <Link href="/features">Features</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/careers">Careers</Link>
          <Link href="/help">Help</Link>
          <Link href="/privacy">Privacy</Link>
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
