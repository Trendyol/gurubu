import React from "react";

export const Pricing = () => {
  return (
    <section className="pricing">
      <div className="pricing__header">
        <h4 className="pricing__header__title">Pricing</h4>
        <p className="pricing__header__subtitle">It&apos;s free now and will be free in the future.</p>
        <p className="pricing__header__description">
          It was developed entirely by developers who support open source, it is our priority to be a useful tool.
        </p>
      </div>
      <div className="pricing__content">
        <div className="pricing__content__header">
          <div>
            <p>Basic Plan</p>
            <p>Always free</p>
          </div>
          <div>
            <span>$</span>
            <span>0</span>
            <span>per month</span>
          </div>
        </div>
        <div className="pricing__box__content">B</div>
      </div>
    </section>
  );
};
