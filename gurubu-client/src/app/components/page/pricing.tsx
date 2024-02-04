import Image from "next/image";
import { PRICING_ITEMS } from "./constants";

export const Pricing = () => {
  return (
    <section className="pricing">
      <div className="pricing__wrapper">
        <div className="pricing__header">
          <h4 className="pricing__header__title">Pricing</h4>
          <p className="pricing__header__subtitle">It&apos;s free now and will be free in the future.</p>
          <p className="pricing__header__description">
            It was developed entirely by developers who support open source, it is our priority to be a useful tool.
          </p>
        </div>
        <div className="pricing__content">
          <div className="pricing__content__header">
            <div className="pricing__content__header__left">
              <p>Basic Plan</p>
              <p>Always free</p>
            </div>
            <div className="pricing__content__header__right">
              <span>$</span>
              <span>0</span>
              <span>per month</span>
            </div>
          </div>
          <div className="pricing__content__offer">
            <div className="pricing__content__offer__header">
              <p>FEATURES</p>
              <span>Everything in our</span>
              <span> free plan </span>
              <span>plus...</span>
            </div>
            <ul className="pricing__content__offer__features">
              {PRICING_ITEMS.BASIC_PLAN.map(({ id, label }) => (
                <li key={id}>
                  <Image src="./check.svg" alt="check" width={24} height={24} />
                  <span>{label}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="pricing__content__get-started">
            <button>Get started</button>
          </div>
        </div>
      </div>
    </section>
  );
};
