export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="skeleton" style={{ width: 160, height: 28 }} />
        <div className="skeleton mt-2" style={{ width: 280, height: 14 }} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="stat-tag">
            <div className="skeleton" style={{ width: 90, height: 12 }} />
            <div className="skeleton mt-3" style={{ width: 60, height: 32 }} />
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {[0, 1].map((panel) => (
          <div key={panel} className="panel">
            <p className="panel__header">
              <span className="skeleton inline-block" style={{ width: 140, height: 12 }} />
            </p>
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="skeleton-row"
                style={{ gridTemplateColumns: "auto 1fr auto" }}
              >
                <div className="skeleton" style={{ width: 8, height: 8, borderRadius: 999 }} />
                <div className="skeleton" style={{ width: "70%", height: 12 }} />
                <div className="skeleton" style={{ width: 40, height: 12 }} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
