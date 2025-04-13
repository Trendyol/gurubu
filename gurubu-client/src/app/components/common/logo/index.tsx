import Image from "next/image";
import Link from "next/link";

type Props = {
  className?: string;
  isLink?: boolean;
  type?: "planner" | "poker";
};

const LogoContent = ({ type }: { type: "planner" | "poker" }) => {
  return (
    <>
      <Image
        src="/logo.svg"
        width={30.93}
        height={29.33}
        alt="Gurubu Logo"
        priority
      />
      <span>{type === "planner" ? "GuruBu Planner" : "GuruBu Planning Poker"}</span>
    </>
  );
};

const Logo: React.FC<Props> = (props) => {
  const { className, isLink = true, type = "poker" } = props;

  if (isLink) {
    return (
      <Link href="/" className={`logo ${className}`}>
        <LogoContent type={type} />
      </Link>
    );
  }
  return (
    <div className={`logo ${className}`}>
      <LogoContent type={type} />
    </div>
  );
};

export default Logo;
