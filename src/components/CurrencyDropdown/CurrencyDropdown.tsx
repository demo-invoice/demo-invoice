/**
 * CurrencyDropdown — fully keyboard-navigable WAI-ARIA combobox/listbox.
 *
 * Keyboard contract:
 *   Tab          → focus trigger button
 *   Enter/Space  → open listbox
 *   ArrowDown    → next option (wraps)
 *   ArrowUp      → previous option (wraps)
 *   Enter        → select highlighted option & close
 *   Escape       → close without selecting, return focus to trigger
 *   Tab (open)   → close & move focus forward (no trap)
 */
import {
  useRef,
  useState,
  useCallback,
  useId,
  type KeyboardEvent,
} from 'react';
import styles from './CurrencyDropdown.module.css';

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'] as const;
export type Currency = (typeof CURRENCIES)[number];

interface Props {
  value: string;
  onChange: (currency: string) => void;
  id?: string;
}

/**
 * Renders a combobox button + listbox panel.
 * The trigger button carries role="combobox" per WAI-ARIA 1.2 pattern.
 */
export function CurrencyDropdown({ value, onChange, id }: Props) {
  const uid = useId();
  const listboxId = `${uid}-listbox`;
  const triggerId = id ?? `${uid}-trigger`;

  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(
    CURRENCIES.indexOf(value as Currency)
  );

  const triggerRef = useRef<HTMLButtonElement>(null);

  const open = useCallback(() => {
    setActiveIndex(CURRENCIES.indexOf(value as Currency));
    setIsOpen(true);
  }, [value]);

  const close = useCallback(() => {
    setIsOpen(false);
    triggerRef.current?.focus();
  }, []);

  const select = useCallback(
    (currency: string) => {
      onChange(currency);
      setIsOpen(false);
      triggerRef.current?.focus();
    },
    [onChange]
  );

  const handleTriggerKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
      }
    },
    [open]
  );

  const handleListKeyDown = useCallback(
    (e: KeyboardEvent<HTMLUListElement>) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex((i) => (i + 1) % CURRENCIES.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex((i) => (i - 1 + CURRENCIES.length) % CURRENCIES.length);
          break;
        case 'Enter':
          e.preventDefault();
          select(CURRENCIES[activeIndex]);
          break;
        case 'Escape':
          e.preventDefault();
          close();
          break;
        case 'Tab':
          // Close without selecting; natural tab order continues
          setIsOpen(false);
          break;
        default:
          break;
      }
    },
    [activeIndex, select, close]
  );

  const activeOptionId = `currency-option-${CURRENCIES[activeIndex]}`;

  return (
    <div className={styles.wrapper}>
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-activedescendant={isOpen ? activeOptionId : undefined}
        className={styles.trigger}
        onClick={() => (isOpen ? close() : open())}
        onKeyDown={handleTriggerKeyDown}
      >
        {value}
        <span className={styles.chevron} aria-hidden="true">
          {isOpen ? '▲' : '▼'}
        </span>
      </button>

      {isOpen && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Currency"
          tabIndex={-1}
          className={styles.listbox}
          onKeyDown={handleListKeyDown}
          // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
        >
          {CURRENCIES.map((currency, index) => (
            <li
              key={currency}
              id={`currency-option-${currency}`}
              role="option"
              aria-selected={currency === value}
              className={[
                styles.option,
                index === activeIndex ? styles.optionActive : '',
                currency === value ? styles.optionSelected : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => select(currency)}
              onMouseEnter={() => setActiveIndex(index)}
            >
              {currency}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
