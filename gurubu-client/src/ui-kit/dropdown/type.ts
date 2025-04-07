import type { ReactNode } from "react";

export interface DropdownOption {
  label: string;
  value: string;
}

export interface DropdownProps {
  options: DropdownOption[];
  value?: string | number | null;
  placeholder?: string;
  onChange?: (value: DropdownOption) => void;
  className?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  renderOption?: (option: DropdownOption) => ReactNode;
  style?: React.CSSProperties;
  id?: string;
}
