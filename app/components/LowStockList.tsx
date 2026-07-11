type LowStockItem = {
  sku: string;
  name: string;
  quantity: number;
  minimumStock: number;
  unit: string;
};

export function LowStockList({ items }: { items: LowStockItem[] }) {
  if (items.length === 0) {
    return (
      <div className="panel">
        <p className="panel__header">Shortage manifest</p>
        <p className="panel__empty">Nothing below its minimum stock level right now.</p>
      </div>
    );
  }

  return (
    <div className="panel">
      <p className="panel__header">
        Shortage manifest — {items.length} item{items.length === 1 ? "" : "s"}
      </p>
      <div>
        {items.map((item) => {
          const isCritical = item.quantity === 0;
          return (
            <div key={item.sku} className="manifest-row">
              <span
                className={`manifest-row__flag ${
                  isCritical ? "manifest-row__flag--critical" : "manifest-row__flag--low"
                }`}
              />
              <span>
                <span className="manifest-row__primary">{item.sku}</span>
                <span className="manifest-row__secondary"> — {item.name}</span>
              </span>
              <span className="manifest-row__qty">
                {item.quantity} {item.unit}
              </span>
              <span className="manifest-row__meta">min {item.minimumStock}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
