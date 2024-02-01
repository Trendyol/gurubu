import classNames from "classnames";
import React, {
  forwardRef,
  ButtonHTMLAttributes,
  AnchorHTMLAttributes,
} from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;
type AnchorProps = AnchorHTMLAttributes<HTMLAnchorElement>;

type CommonProps = {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
};

type CustomButtonProps = CommonProps &
  (
    | ({
        as: "button";
        onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
      } & ButtonProps)
    | ({ as: "a"; href: string } & AnchorProps)
  );

/**
 * Generic Button component for rendering button or anchor (a) elements.
 * @example
 * // Render a button
 * <CustomButton>
 *   Click me
 * </CustomButton>
 *
 * // Render an anchor (a) with href
 * <CustomButton as="a" href="/example">
 *   Go to example
 * </CustomButton>
 *
 * @param {Object} props - The properties of the component.
 * @param {'button' | 'a'} [props.as='button'] - The type of element to render ('button' or 'a').
 * @param {React.ReactNode} [props.children] - The content to be rendered inside the button or anchor.
 * @param {React.RefObject<HTMLElement>} [ref] - Forwarded ref to the underlying DOM element.
 *
 * @returns {React.ReactElement} The rendered CustomButton component.
 */

const Button = forwardRef<HTMLElement, CustomButtonProps>(
  (
    { as = "button", children, variant = "primary", className, ...rest },
    ref
  ) => {
    if (as === "a" && !("href" in rest)) {
      throw new Error(
        "You must provide an href when using CustomButton as an anchor element"
      );
    }

    if (as === "a") {
      const { type, ...anchorProps } = rest as AnchorProps;
      return (
        <a
          className={classNames("cta", {
            primary: variant === "primary",
            secondary: variant === "secondary",
            className,
          })}
          ref={ref as React.RefObject<HTMLAnchorElement>}
          {...anchorProps}
        >
          {children}
        </a>
      );
    }

    if (as === "button" && !("onClick" in rest)) {
      throw new Error(
        "You must provide an onClick handler when using CustomButton as a button element"
      );
    }

    return (
      <button
        className={classNames("cta", {
          primary: variant === "primary",
          secondary: variant === "secondary",
          className,
        })}
        ref={ref as React.RefObject<HTMLButtonElement>}
        {...(rest as ButtonProps)}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
