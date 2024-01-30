import Link from "next/link";

export default function NotFound() {
  return (
    <div className="room-not-found">
      <h2 className="room-not-found__header">Grooming Room Not Found</h2>
      <p>Rooms are available for only 6 hours after they are created.</p>
      <Link href="/" className="room-not-found__link">
        Return to Homepage
      </Link>
    </div>
  );
}