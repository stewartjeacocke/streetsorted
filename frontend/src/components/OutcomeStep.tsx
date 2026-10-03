export function OutcomeStep({
  message,
  reference,
  retry,
  onReset,
  onRetry,
}: {
  message: string;
  reference?: string | null;
  retry?: boolean;
  onReset: () => void;
  onRetry: () => void;
}) {
  return (
    <section>
      <h2>Submission outcome</h2>
      <p>{message}</p>
      {reference && <p>Reference: {reference}</p>}
      {retry && <button onClick={onRetry}>Try submission again</button>}
      <button onClick={onReset}>Start a new report</button>
    </section>
  );
}
