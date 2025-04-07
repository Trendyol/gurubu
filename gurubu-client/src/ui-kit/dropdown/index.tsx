import React, {
  useState,
  useRef,
  useEffect,
  KeyboardEvent,
  ChangeEvent,
} from "react";
import classNames from "classnames";
import Input from "../input";
import { IconChevronDown } from "@tabler/icons-react";
import { DropdownOption, DropdownProps } from "./type";
import "./style.scss";
import { normalize } from "@/shared/helpers/normalize";

export const Dropdown: React.FC<DropdownProps> = ({
  id,
  options,
  value,
  placeholder = "Select",
  className = "",
  disabled = false,
  error,
  label,
  style,
  renderOption,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [filteredOptions, setFilteredOptions] =
    useState<DropdownOption[]>(options);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const normalizedSearch = normalize(searchValue);

    setFilteredOptions(
      options.filter(
        (option) =>
          !searchValue || normalize(option.label).includes(normalizedSearch)
      )
    );
  }, [searchValue, options]);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
      setSearchValue("");
    }
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchValue("");
      }
    }
  };

  const handleOptionClick = (option: DropdownOption) => {
    onChange?.(option);
    setIsOpen(false);
    setSearchValue("");
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }

    if (isOpen && e.key === "Enter" && filteredOptions.length === 1) {
      handleOptionClick(filteredOptions[0]);
    }
  };

  return (
    <div
      className={classNames("dropdown", className)}
      ref={dropdownRef}
      onKeyDown={handleKeyDown}
      style={style}
      id={id}
    >
      {label && <div className="dropdown__label">{label}</div>}

      <div
        className={classNames("dropdown__trigger", {
          "dropdown__trigger--disabled": disabled,
          "dropdown__trigger--error": error,
          "dropdown__trigger--active": isOpen,
        })}
        onClick={toggleDropdown}
      >
        <div className="dropdown__trigger-content">
          {isOpen ? (
            <div className="dropdown__trigger-search">
              <Input
                ref={inputRef}
                className="dropdown__trigger-search-input-wrapper"
                inputClassName="dropdown__trigger-search-input"
                placeholder=""
                value={searchValue}
                onChange={handleSearchChange}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          ) : (
            <>
              {selectedOption ? (
                <span className="dropdown__trigger-selected-value">
                  {selectedOption.label}
                </span>
              ) : (
                <span className="dropdown__trigger-placeholder">
                  {placeholder}
                </span>
              )}
            </>
          )}
        </div>
        <IconChevronDown
          size={18}
          className={classNames("dropdown__trigger-arrow-icon", {
            "dropdown__trigger-arrow-icon--open": isOpen,
          })}
        />
      </div>

      {error && <span className="dropdown__error-text">{error}</span>}

      {isOpen && (
        <div className="dropdown__panel">
          <div className="dropdown__options-container">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={classNames("dropdown__option", {
                    "dropdown__option--selected": option.value === value,
                  })}
                  onClick={() => handleOptionClick(option)}
                >
                  {renderOption ? renderOption(option) : option.label}
                </div>
              ))
            ) : (
              <div className="dropdown__no-options">Not found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export type { DropdownOption, DropdownProps };
