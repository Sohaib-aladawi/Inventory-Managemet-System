export default function TripDetailLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="skeleton" style={{ width: 90, height: 14 }} />

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="skeleton" style={{ width: 140, height: 28 }} />
          <div className="skeleton mt-2" style={{ width: 100, height: 14 }} />
        </div>
        <div className="skeleton" style={{ width: 80, height: 22 }} />
      </div>

      <div className="detail-summary">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <div className="skeleton" style={{ width: 80, height: 11 }} />
            <div className="skeleton mt-2" style={{ width: 110, height: 16 }} />
          </div>
        ))}
      </div>

      <div className="panel">
        <p className="panel__header">
          <span className="skeleton inline-block" style={{ width: 140, height: 12 }} />
        </p>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton-row" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
            {Array.from({ length: 5 }).map((_, j) => (
              <div key={j} className="skeleton" style={{ width: "70%", height: 12 }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
