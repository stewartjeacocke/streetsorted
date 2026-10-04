export function ReportDetailsStep({
  value,
  message,
  onChange,
  onReview,
  onCancel,
}: {
  value: string;
  message: string;
  onChange: (v: string) => void;
  onReview: () => void;
  onCancel: () => void;
}) {
  return (
    <section>
      <h2>Tell us about the fly-tipping</h2>
      <p>
        <strong>Category:</strong> Fly-tipping
      </p>
      <label>
        Description
        <textarea
          aria-label="Description"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={1000}
        />
      </label>
      <p role="alert">{message}</p>
      <button onClick={onReview}>Review report</button>
      <button onClick={onCancel}>Cancel</button>
    </section>
  );
}
