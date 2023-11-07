import Link from "next/link";

const Navbar = () => {
  return (
    <nav className="nav">
      <h1 className="nav__logo">
        <Link href="/">Gurubu</Link>
      </h1>
    </nav>
  );
};

export default Navbar;
