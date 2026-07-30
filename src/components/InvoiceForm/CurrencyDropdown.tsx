import {
  useState,
  useRef,
  useEffect,
  useId,
  type KeyboardEvent,
} from 'react';

/** Supported currencies exported for use in tests and other components. */
export const CURRENCIES: { value: string; label: string }[] = [
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'GBP', label: 'GBP — British Pound' },
  { value: 'CAD', label: 'CAD — Canadian Dollar' },
  { value: 'AUD', label: 'AUD — Australian Dollar' },
  { value: 'JPY', label: 'JPY — Japanese Yen' },
];

interface CurrencyDropdownProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  'aria-describedby'?: string;
}

/**
 * Fully accessible ARIA combobox for currency selection.
 * Keyboard: ↑/↓ navigate, Enter/Space open, Escape close, Tab close without trap.
 */
export function CurrencyDropdown({
  value,
  onChange,
  id,
  'aria-describedby': ariaDescribedby,
}: CurrencyDropdownProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(() =>
    Math.max(0, CURRENCIES.findIndex((c) => c.value === value)),
  );
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectedLabel =
    CURRENCIES.find((c) => c.value === value)?.label ?? value;

  /** Sync activeIndex when value changes externally. */
  useEffect(() => {
    const idx = CURRENCIES.findIndex((c) => c.value === value);
    if (idx >= 0) setActiveIndex(idx);
  }, [value]);

  /** Close listbox when focus leaves the container. */
  useEffect(() => {
    if (!open) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [open]);

  function openList() {
    setOpen(true);
  }

  function closeList() {
    setOpen(false);
  }

  function selectOption(index: number) {
    onChange(CURRENCIES[index].value);
    setActiveIndex(index);
    closeList();
    buttonRef.current?.focus();
  }

  function handleButtonKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        open ? selectOption(activeIndex) : openList();
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!open) {
          openList();
        } else {
          setActiveIndex((i) => Math.min(i + 1, CURRENCIES.length - 1));
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (!open) {
          openList();
        } else {
          setActiveIndex((i) => Math.max(i - 1, 0));
        }
        break;
      case 'Escape':
        e.preventDefault();
        closeList();
        break;
      case 'Tab':
        // Close without trapping — let Tab move focus naturally
        closeList();
        break;
    }
  }

  function handleBlur() {
    // Small timeout lets focus settle before we check if it left the container
    setTimeout(() => {
      if (containerRef.current && !containerRef.current.contains(document.activeElement)) {
        setOpen(false);
      }
    }, 100);
  }

  const activeOptionId = open ? `${listboxId}-option-${activeIndex}` : undefined;

  return (
    <div ref={containerRef} style={{ position: 'relative' }} onBlur={handleBlur}>
      <button
        ref={buttonRef}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-activedescendant={activeOptionId}
        aria-describedby={ariaDescribedby}
        onClick={() => (open ? closeList() : openList())}
        onKeyDown={handleButtonKeyDown}
        style={{
          width: '100%',
          textAlign: 'left',
          padding: '6px 10px',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius)',
          background: '#fff',
          cursor: 'pointer',
        }}
      >
        {selectedLabel}
      </button>

      {open && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Currency"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            margin: 0,
            padding: 0,
            listStyle: 'none',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
            background: '#fff',
            zIndex: 100,
            maxHeight: '200px',
            overflowY: 'auto',
          }}
        >
          {CURRENCIES.map((currency, index) => (
            <li
              key={currency.value}
              id={`${listboxId}-option-${index}`}
              role="option"
              aria-selected={currency.value === value}
              onMouseDown={(e) => {
                e.preventDefault(); // prevent blur before click registers
                selectOption(index);
              }}
              style={{
                padding: '6px 10px',
                background: index === activeIndex ? '#dbeafe' : '#fff',
                cursor: 'pointer',
              }}
            >
              {currency.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
