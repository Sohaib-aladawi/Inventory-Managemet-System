export function TableSkeleton({
  columns,
  rows = 5,
  withTabs = false,
}: {
  columns: number;
  rows?: number;
  withTabs?: boolean;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="skeleton" style={{ width: 120, height: 28 }} />
          <div className="skeleton mt-2" style={{ width: 260, height: 14 }} />
        </div>
        <div className="flex items-center gap-3">
          <div className="skeleton" style={{ width: 200, height: 38 }} />
          <div className="skeleton" style={{ width: 110, height: 38 }} />
        </div>
      </div>

      {withTabs && (
        <div className="tab-bar">
          <div className="skeleton" style={{ width: 60, height: 14, margin: "0.5rem 0" }} />
          <div className="skeleton" style={{ width: 60, height: 14, margin: "0.5rem 0" }} />
        </div>
      )}

      <div className="panel">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="skeleton-row"
            style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
          >
            {Array.from({ length: columns }).map((_, j) => (
              <div
                key={j}
                className="skeleton"
                style={{ width: j === columns - 1 ? "50%" : "80%", height: 12 }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
