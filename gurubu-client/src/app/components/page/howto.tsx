import Image from "next/image";
import { HOW_TO_ITEMS } from "./constants";

const Howto = () => {
  return (
    <section className="how-to-section">
      <Image
        priority
        src="/scrum-board.svg"
        alt="scrum-board"
        width={200}
        height={200}
      />
      <div className="how-to">
        <h4 className="how-to__title">How to start</h4>
        <ul className="how-to__list">
          {HOW_TO_ITEMS.map((item, index) => (
            <li key={item.id} className="how-to__list-item">
              <span>{"->"}</span> {item.text}
            </li>
          ))}
        </ul>
      </div>
      <Image
        priority
        src="/thinking-code.svg"
        alt="thinking-code"
        width={200}
        height={200}
      />
    </section>
  );
};

export default Howto;
