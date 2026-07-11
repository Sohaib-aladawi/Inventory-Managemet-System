"use client";

import { useEffect, useState } from "react";
import { ItemFormPanel, type ItemRecord } from "./ItemFormPanel";

export function ItemsExplorer({ initialItems }: { initialItems: ItemRecord[] }) {
  const [items, setItems] = useState<ItemRecord[]>(initialItems);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [panel, setPanel] = useState<
    { mode: "create" } | { mode: "edit"; item: ItemRecord } | null
  >(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function refresh(query: string) {
    setLoading(true);
    try {
      const url = query ? `/api/items?search=${encodeURIComponent(query)}` : "/api/items";
      const res = await fetch(url);
      if (res.ok) {
        setItems(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeout = setTimeout(() => refresh(search), 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function handleDelete(sku: string) {
    setDeleteError(null);
    if (!confirm(`Delete item ${sku}? This cannot be undone.`)) return;

    const res = await fetch(`/api/items/${sku}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setDeleteError(data?.message ?? `Could not delete ${sku}.`);
      return;
    }
    setItems((prev) => prev.filter((item) => item.sku !== sku));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="page-title text-2xl">Items</h1>
          <p className="text-sm mt-1" style={{ color: "var(--steel)" }}>
            Stock records — SKUs, units, and minimum thresholds.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            className="search-input"
            placeholder="Search by SKU…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search items by SKU"
          />
          <button className="btn" onClick={() => setPanel({ mode: "create" })}>
            Add item
          </button>
        </div>
      </div>

      {deleteError && <p className="form-error">{deleteError}</p>}

      <div className="panel">
        {items.length === 0 ? (
          <p className="panel__empty">
            {loading ? "Loading…" : "No items match that search."}
          </p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Name</th>
                <th>Unit</th>
                <th>On hand</th>
                <th>Min stock</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const isLow = item.quantity <= item.minimumStock;
                return (
                  <tr key={item.sku}>
                    <td className="data-table__sku">{item.sku}</td>
                    <td className="data-table__name">{item.name}</td>
                    <td>{item.unit}</td>
                    <td className={isLow ? "data-table__qty--low" : ""}>{item.quantity}</td>
                    <td>{item.minimumStock}</td>
                    <td>
                      <div className="data-table__actions">
                        <button
                          className="btn btn--ghost btn--sm"
                          onClick={() => setPanel({ mode: "edit", item })}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn--rust btn--sm"
                          onClick={() => handleDelete(item.sku)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {panel && (
        <ItemFormPanel
          mode={panel.mode}
          initialItem={panel.mode === "edit" ? panel.item : undefined}
          onClose={() => setPanel(null)}
          onSaved={() => {
            setPanel(null);
            refresh(search);
          }}
        />
      )}
    </div>
  );
}
