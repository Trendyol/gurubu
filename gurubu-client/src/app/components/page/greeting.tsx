import Link from "next/link";

const Greeting = () => {
  return (
    <div className="greeting-box">
      <h3 className="greeting-box__title">Simple, fast and practical</h3>
      <p className="greeting-box__description">
        Agree with your teammates quickly and reliably! Start by setting up a
        room.
      </p>
      <Link href="/create/room" className="greeting-box__button">
        Create Room
      </Link>
    </div>
  );
};

export default Greeting;
