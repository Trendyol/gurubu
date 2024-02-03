"use client";

import Link from "next/link";
import { GoBackButton } from "./components/error/go-back-button";
import "./styles/error/style.scss";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="not-found-page">
      <h1 className="not-found-page__title">500 error</h1>
      <h2 className="not-found-page__subtitle">{error && error.message}</h2>
      <p className="not-found-page__description">
        We searched high and low, but couldn’t find what you’re looking for. Let’s find a better place for you to go.
      </p>
      <div className="not-found-page__navigation">
        <GoBackButton />
        <Link className="not-found-page__navigation__take-me-home" href="/">
          Take me home
        </Link>
      </div>
    </main>
  );
}
