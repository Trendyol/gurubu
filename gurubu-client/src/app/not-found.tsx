import Link from "next/link";
import { GoBackButton } from "./components/error/go-back-button";
import "./styles/error/style.scss";

export default function NotFound() {
  return (
    <html>
      <body>
        <main className="not-found-page">
          <h1 className="not-found-page__title">404 error</h1>
          <h2 className="not-found-page__subtitle">We lost this page</h2>
          <p className="not-found-page__description">
            We searched high and low, but couldn’t find what you’re looking for. Let’s find a better place for you to
            go.
          </p>
          <div className="not-found-page__navigation">
            <GoBackButton />
            <Link className="not-found-page__navigation__take-me-home" href="/">
              Take me home
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
