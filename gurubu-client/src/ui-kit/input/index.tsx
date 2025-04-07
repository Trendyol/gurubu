import React, { ChangeEvent, InputHTMLAttributes } from "react";
import classNames from "classnames";
import "./style.scss";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  className?: string;
  inputClassName?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      fullWidth = false,
      className = "",
      inputClassName = "",
      onChange,
      ...props
    },
    ref
  ) => {
    return (
      <div
        className={classNames("input-field", className, {
          "input-field--full-width": fullWidth,
        })}
      >
        {label && <label className="input-field__label">{label}</label>}
        <input
          ref={ref}
          className={classNames("input-field__input", inputClassName, {
            "input-field__input--error": error,
          })}
          onChange={onChange}
          {...props}
        />
        {error && <span className="input-field__error">{error}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
