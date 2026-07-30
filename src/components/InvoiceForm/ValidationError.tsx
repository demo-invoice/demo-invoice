interface ValidationErrorProps {
  messages: string[];
  id?: string;
}

/**
 * Renders a list of validation error messages.
 * Returns null when the messages array is empty to avoid empty list announcements.
 */
export function ValidationError({ messages, id }: ValidationErrorProps) {
  if (messages.length === 0) return null;
  return (
    <div id={id} className="error-text" role="alert" aria-atomic="true">
      {messages.length === 1 ? (
        <span>{messages[0]}</span>
      ) : (
        <ul>
          {messages.map((msg, i) => (
            <li key={i}>{msg}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
