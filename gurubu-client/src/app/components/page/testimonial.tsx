import Image from "next/image";

const Testimonial = () => {
  const testimonialText =
    "Software processes don't always have to be complex. Meet with your team, score the tasks while the product manager explains their content, and plan your next sprint. No need to log in. It's that easy. I love it.";
  return (
    <section id="testimonials" className="testimonial-section">
      <div className="testimonial">
        <Image
          width={140}
          height={40}
          alt="grubu-logo"
          src="/gurubu-logo.svg"
        />
        <p className="testimonial__text">{testimonialText}</p>
        <div className="testimonial__owner">
          <Image
            className="testimonial__avatar"
            src="/testimonial-avatar.png"
            width={64}
            height={64}
            alt="testmonial-avatar"
          />
          <span className="testimonial__owner__name">Enes Başpınar</span>
          <span className="testimonial__owner__title">
            Software Engineer, Trendyol
          </span>
        </div>
      </div>
    </section>
  );
};

export default Testimonial;
