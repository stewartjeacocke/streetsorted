import type { Location } from '../api/report-api';
export function ReviewStep({
  location,
  description,
  onConfirm,
  onEdit,
  onCancel,
}: {
  location: Location;
  description: string;
  onConfirm: () => void;
  onEdit: () => void;
  onCancel: () => void;
}) {
  return (
    <section>
      <h2>Review report</h2>
      <p>
        Detected location ({location.latitude.toFixed(5)}, {location.longitude.toFixed(5)})
      </p>
      <p>{description}</p>
      <button onClick={onConfirm}>Confirm and submit report</button>
      <button onClick={onEdit}>Edit description</button>
      <button onClick={onCancel}>Cancel</button>
    </section>
  );
}
