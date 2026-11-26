import type { ComponentProps } from "react";
import classNames from "classnames";
import styles from "./dashboard.module.scss";

// Adapted from shadcn/ui Card and Button. Styles use Gurubu's Sass setup.
export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="card" className={classNames(styles.card, className)} {...props} />;
}

export function CardHeader({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="card-header" className={classNames(styles.cardHeader, className)} {...props} />;
}

export function CardTitle(props: ComponentProps<"h2">) {
  return <h2 data-slot="card-title" {...props} />;
}

export function Button({
  variant = "outline",
  type = "button",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: "primary" | "outline" }) {
  return (
    <button
      type={type}
      data-slot="button"
      data-variant={variant}
      className={classNames(styles.button, className)}
      {...props}
    />
  );
}
