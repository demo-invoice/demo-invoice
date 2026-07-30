/**
 * ValidationError — always mounted live region.
 *
 * The container div is NEVER conditionally removed from the DOM.
 * role="alert" and aria-live="assertive" are static attributes so
 * screen readers register the live region on page load.
 * Visual visibility is toggled via CSS class only.
 */
export function ValidationError({
  id,
  messages,
}: {
  id: string;
  messages: string[];
}) {
  const hasMessages = messages.length > 0;
  return (
    <div
      id={id}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className={hasMessages ? 'validation-error' : 'validation-error visually-hidden'}
    >
      {hasMessages && (
        <ul>
          {messages.map((msg) => (
            <li key={msg}>{msg}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
