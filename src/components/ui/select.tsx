'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type SelectOption = {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
  title?: string;
};

export interface SelectProps
  extends Pick<
    React.SelectHTMLAttributes<HTMLSelectElement>,
    'className' | 'disabled' | 'id' | 'name' | 'required' | 'title' | 'value' | 'onChange'
  > {
  children?: React.ReactNode;
  options?: SelectOption[];
  placeholder?: string;
  defaultValue?: string | number;
  onValueChange?: (value: string) => void;
  menuClassName?: string;
  optionClassName?: string;
}

function isOptionElement(
  child: React.ReactNode
): child is React.ReactElement<React.OptionHTMLAttributes<HTMLOptionElement>> {
  return React.isValidElement(child) && child.type === 'option';
}

function isOptgroupElement(
  child: React.ReactNode
): child is React.ReactElement<React.OptgroupHTMLAttributes<HTMLOptGroupElement>> {
  return React.isValidElement(child) && child.type === 'optgroup';
}

function getTextFromNode(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(getTextFromNode).join('');
  }

  return '';
}

function createChangeEvent(value: string): React.ChangeEvent<HTMLSelectElement> {
  return {
    target: { value },
    currentTarget: { value },
  } as React.ChangeEvent<HTMLSelectElement>;
}

function extractOptions(children: React.ReactNode): SelectOption[] {
  return React.Children.toArray(children).flatMap((child) => {
    if (isOptionElement(child)) {
      return [
        {
          value:
            child.props.value === undefined
              ? getTextFromNode(child.props.children)
              : String(child.props.value),
          label: child.props.children,
          disabled: child.props.disabled,
          title: child.props.title,
        },
      ];
    }

    if (isOptgroupElement(child)) {
      return extractOptions(child.props.children);
    }

    return [];
  });
}

const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      className,
      children,
      options,
      value,
      defaultValue,
      onChange,
      onValueChange,
      placeholder,
      disabled,
      name,
      id,
      required,
      title,
      menuClassName,
      optionClassName,
    },
    ref
  ) => {
    const dropdownRef = React.useRef<HTMLDivElement>(null);
    const buttonRef = React.useRef<HTMLButtonElement | null>(null);
    const [isOpen, setIsOpen] = React.useState(false);
    const [menuWidth, setMenuWidth] = React.useState<number>();
    const [internalValue, setInternalValue] = React.useState(() =>
      defaultValue === undefined ? '' : String(defaultValue)
    );

    const normalizedOptions = React.useMemo<SelectOption[]>(() => {
      if (options) {
        return options.map((option) => ({
          ...option,
          value: String(option.value),
        }));
      }

      return extractOptions(children);
    }, [children, options]);

    const selectedValue = value === undefined ? internalValue : String(value);
    const selectedOption = normalizedOptions.find((option) => option.value === selectedValue);
    const displayLabel = selectedOption?.label ?? placeholder ?? 'Выберите';
    const displayTitle =
      title ?? selectedOption?.title ?? getTextFromNode(selectedOption?.label ?? displayLabel);
    const setButtonRef = React.useCallback(
      (node: HTMLButtonElement | null) => {
        buttonRef.current = node;

        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref]
    );

    React.useEffect(() => {
      if (!isOpen) return;

      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    React.useLayoutEffect(() => {
      if (!isOpen || !buttonRef.current) return;

      const button = buttonRef.current;
      const buttonRect = button.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(button);
      const context = document.createElement('canvas').getContext('2d');
      const fontSize = computedStyle.fontSize || '14px';
      const fontFamily = computedStyle.fontFamily || 'sans-serif';
      const fontWeight = computedStyle.fontWeight || '400';
      const textWidths = normalizedOptions.map((option) => {
        const label = getTextFromNode(option.label);

        if (context) {
          context.font = `${fontWeight} ${fontSize} ${fontFamily}`;
          return context.measureText(label).width;
        }

        return label.length * 8;
      });

      const widestOption = Math.max(0, ...textWidths);
      const desiredWidth = Math.ceil(Math.max(buttonRect.width, widestOption + 56));
      const availableWidth = Math.max(buttonRect.width, window.innerWidth - buttonRect.left - 16);

      setMenuWidth(Math.min(desiredWidth, availableWidth));
    }, [isOpen, normalizedOptions]);

    const handleSelect = (option: SelectOption) => {
      if (option.disabled) return;

      if (value === undefined) {
        setInternalValue(option.value);
      }

      onValueChange?.(option.value);
      onChange?.(createChangeEvent(option.value));
      setIsOpen(false);
    };

    return (
      <div className="relative w-full" ref={dropdownRef}>
        {name && (
          <input
            type="hidden"
            name={name}
            value={selectedValue}
            disabled={disabled}
            required={required}
          />
        )}
        <button
          ref={setButtonRef}
          id={id}
          type="button"
          disabled={disabled}
          title={displayTitle}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setIsOpen(false);
            }
          }}
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-left text-sm text-gray-900 ring-offset-background transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8eba1e]/25 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 disabled:opacity-70',
            className
          )}
        >
          <span className="block min-w-0 truncate">{displayLabel}</span>
          <ChevronDown
            className={cn(
              'ml-2 h-4 w-4 shrink-0 text-gray-400 transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        </button>

        {isOpen && !disabled && (
          <div
            className={cn(
              'absolute z-50 mt-1 max-h-72 min-w-full max-w-[calc(100vw-2rem)] overflow-auto rounded-lg border border-gray-300 bg-white py-1 text-sm shadow-lg',
              menuClassName
            )}
            style={menuWidth ? { width: menuWidth } : undefined}
            role="listbox"
          >
            {normalizedOptions.map((option, index) => {
              const isSelected = option.value === selectedValue;

              return (
                <button
                  key={`${option.value}-${index}`}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={option.disabled}
                  title={option.title ?? getTextFromNode(option.label)}
                  onClick={() => handleSelect(option)}
                  onMouseDown={(event) => event.preventDefault()}
                  className={cn(
                    'min-w-full w-max px-4 py-2 text-left transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400',
                    isSelected ? 'bg-[#8eba1e]/10 font-medium text-[#8eba1e]' : 'text-gray-700',
                    optionClassName
                  )}
                >
                  <span className="block whitespace-nowrap">{option.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }
);
Select.displayName = 'Select';

export { Select };
