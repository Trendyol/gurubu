import Button from "../common/button";
import Image from "next/image";

const HeroSection = () => {
  return (
    <section className="hero-section">
      <div>
        <h1>Simple, fast and practical</h1>
        <p>
          Agree with your teammates quickly and reliably! Start by setting up a
          room.
        </p>
        <Button as="a" href="/create">
          <Image
            src="/play-circle.svg"
            width={24}
            height={24}
            alt="Create room"
          />
          Create room
        </Button>
      </div>
      <Image
        src="/demo-preview.png"
        width={688}
        height={512}
        alt="Demo preview of Gurubu"
        priority
        className="hero-section__demo-preview"
      />
    </section>
  );
};

export default HeroSection;
