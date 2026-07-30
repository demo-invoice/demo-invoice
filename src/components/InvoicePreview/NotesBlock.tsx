import styles from './InvoicePreview.module.css';

interface NotesBlockProps {
  notes: string;
}

/**
 * Renders the notes section only when `notes` is a non-empty string.
 * When absent, renders nothing — no orphan label in the DOM.
 */
export function NotesBlock({ notes }: NotesBlockProps): JSX.Element | null {
  if (!notes.trim()) return null;

  return (
    <div className={styles.notesBlock}>
      <div className={styles.notesLabel}>Notes</div>
      <div>{notes}</div>
    </div>
  );
}
