import Image from "next/image";
import Link from "next/link";
import { Space_Grotesk } from "next/font/google";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

type Props = {
  className?: string;
  isLink?: boolean;
};

const LogoContent = () => {
  return (
    <>
      <Image
        src="/logo.svg"
        width={30.93}
        height={29.33}
        alt="Gurubu Logo"
        priority
      />
      <span className={spaceGrotesk.className}>GuruBu</span>
    </>
  );
};

const Logo: React.FC<Props> = (props) => {
  const { className, isLink = true } = props;

  if (isLink) {
    return (
      <Link href="/" className={`logo ${className}`}>
        <LogoContent />
      </Link>
    );
  }
  return (
    <div className={`logo ${className}`}>
      <LogoContent />
    </div>
  );
};

export default Logo;
