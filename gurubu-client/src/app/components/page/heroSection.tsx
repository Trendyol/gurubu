import Button from "../common/button";
import Image from "next/image";
import { IconCircleCaretRight } from "@tabler/icons-react";

const HeroSection = () => {
  return (
    <section className="hero-section">
      <div>
        <h1>Simple, fast and practical</h1>
        <p>
          Agree with your teammates quickly and reliably! Start by setting up a
          room.
        </p>
        <Button as="a" href="/create/room">
          <IconCircleCaretRight />
          Create room
        </Button>
      </div>
      <Image
        src="https://cdn.dsmcdn.com/web/production/gurubu-home-demo.png"
        width={1000}
        height={900}
        alt="Demo preview of Gurubu"
        priority
        className="hero-section__demo-preview"
        placeholder="blur"
        blurDataURL="/gurubu-logo.svg"
      />
    </section>
  );
};

export default HeroSection;
