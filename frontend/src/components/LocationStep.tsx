export function LocationStep({ message, onLocate }: { message: string; onLocate: () => void }) {
  return (
    <section>
      <h2>Location required</h2>
      <p>Allow browser location access to continue. The detected location cannot be edited.</p>
      <p role="status">{message}</p>
      <button onClick={onLocate}>Use my location</button>
      <button onClick={onLocate}>Retry location</button>
    </section>
  );
}
