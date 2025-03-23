import React, { useState } from "react";
import Select, { 
  components, 
  OptionProps, 
  Props, 
  SingleValue, 
  GroupBase 
} from 'react-select';
import { IconChevronDown, IconSearch } from "@tabler/icons-react";

export interface SelectOption {
  value: any;
  label: string;
}

interface FilterableSelectProps<T extends SelectOption> {
  options: T[];
  value: T | null;
  onChange: (option: SingleValue<T>) => void;
  isDisabled?: boolean;
  placeholder?: string;
  noOptionsMessage?: string;
  className?: string;
  ariaLabel?: string;
}

function CustomOption<T extends SelectOption>(
  props: OptionProps<T, false, GroupBase<T>>
) {
  const { data } = props;
  
  if (data.label.includes(' - ')) {
    const [key, ...summaryParts] = data.label.split(' - ');
    const summary = summaryParts.join(' - ');
    
    return (
      <components.Option {...props}>
        <div>
          <div className="option-key">{key}</div>
          <div className="option-summary">{summary}</div>
        </div>
      </components.Option>
    );
  }
  
  return (
    <components.Option {...props}>
      {data.label}
    </components.Option>
  );
}

const CustomControl = ({ children, ...props }: any) => {
  return (
    <components.Control {...props}>
      <IconSearch size={16} className="search-icon" />
      {children}
    </components.Control>
  );
};

export const FilterableSelect = <T extends SelectOption>({
  options,
  value,
  onChange,
  isDisabled = false,
  placeholder = "Select...",
  noOptionsMessage = "No matching option found",
  className = "",
  ariaLabel
}: FilterableSelectProps<T>) => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  
  const selectProps: Props<T, false> = {
    className: `filterable-select-container ${className}`,
    classNamePrefix: "filterable-select",
    options,
    isSearchable: true,
    placeholder,
    noOptionsMessage: () => noOptionsMessage,
    onMenuOpen: () => setIsMenuOpen(true),
    onMenuClose: () => setIsMenuOpen(false),
    menuIsOpen: undefined,
    isClearable: false,
    components: {
      IndicatorSeparator: () => null,
      DropdownIndicator: () => (
        <div className="filterable-select__dropdown-indicator">
          <IconChevronDown size={18} />
        </div>
      ),
      Option: CustomOption,
      Control: CustomControl,
    },
    styles: {
      input: (base) => ({
        ...base,
        padding: '2px',
        margin: '0',
        color: '#172B4D',
      }),
      menu: (base) => ({
        ...base,
        zIndex: 100,
      }),
    }
  };

  return (
    <div className="select-wrapper">
      <Select<T>
        {...selectProps}
        value={value}
        onChange={onChange}
        isDisabled={isDisabled}
        aria-label={ariaLabel}
      />
      {!isMenuOpen && (
        <div className="filter-hint">
          <IconSearch size={14} />
          <span>Click and type to search</span>
        </div>
      )}
    </div>
  );
};

export default FilterableSelect; 