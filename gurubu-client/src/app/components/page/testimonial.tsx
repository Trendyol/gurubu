import Image from "next/image";

const Testimonial = () => {
  return (
    <section className="testimonial-section">
      <div className="testimonial">
        <Image
          width={140}
          height={40}
          alt="grubu-logo"
          src="/gurubu-logo.svg"
        />
        <p className="testimonial__text">
          I was looking for an application that could quickly determine story
          points without registration, and I finally found it.
        </p>
        <div className="testimonial__owner">
          <Image
            src="/testimonial-avatar.png"
            width={64}
            height={64}
            alt="testmonial-avatar"
          />
          <span className="testimonial__owner__name">Cihat Bilgiç</span>
          <span className="testimonial__owner__title">
            Product Owner, Trendyol
          </span>
        </div>
      </div>
    </section>
  );
};

export default Testimonial;
