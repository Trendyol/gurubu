import Image from "next/image";

const Features = () => {
  return (
    <section className="features-section">
      <div className="features-heading">
        <div className="features-heading__pillbox">Features</div>
        <p className="features-heading__title">No registration, share the link with your teammates and get started!</p>
        <p className="features-heading__subtext">It is enough to create a room and share the link with your friends. We do not store any of your information!</p>
      </div>
      <div className="features-spotlight">
        <Image src={'/screen-mockup.svg'} width={768} height={512} alt="An example of in app visuals" />
      </div>
      <div className="features-tabs">
        <div className="features-tabs__score">
          <p className="title">Score grooming</p>
          <p className="description">If you want to score and sort tasks according to more than one metric, this option is for you!</p>
        </div>
        <div className="features-tabs__planning">
          <p className="title">Planning poker</p>
          <p className="description">If you only want to determine story points, you can choose this option that will allow you to score according to Fibonacci.</p>
        </div>
      </div>
    </section>
  );
};

export default Features;
