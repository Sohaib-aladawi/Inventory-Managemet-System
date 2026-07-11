"use client";

import { useState } from "react";

export type ItemRecord = {
  sku: string;
  name: string;
  unit: "pcs" | "kg" | "liters" | "boxes" | "packs";
  quantity: number;
  minimumStock: number;
};

const UNIT_OPTIONS = ["pcs", "kg", "liters", "boxes", "packs"] as const;

type ItemFormPanelProps = {
  mode: "create" | "edit";
  initialItem?: ItemRecord;
  onClose: () => void;
  onSaved: () => void;
};

export function ItemFormPanel({ mode, initialItem, onClose, onSaved }: ItemFormPanelProps) {
  const [sku, setSku] = useState(initialItem?.sku ?? "");
  const [name, setName] = useState(initialItem?.name ?? "");
  const [unit, setUnit] = useState<(typeof UNIT_OPTIONS)[number]>(initialItem?.unit ?? "pcs");
  const [quantity, setQuantity] = useState(String(initialItem?.quantity ?? 0));
  const [minimumStock, setMinimumStock] = useState(String(initialItem?.minimumStock ?? 0));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const body = {
      sku,
      name,
      unit,
      quantity: Number(quantity),
      minimumStock: Number(minimumStock),
    };

    try {
      const res = await fetch(
        mode === "create" ? "/api/items" : `/api/items/${initialItem!.sku}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.message ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      onSaved();
    } catch {
      setError("Could not reach the server. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="slideover-backdrop" onClick={onClose} />
      <div className="slideover" role="dialog" aria-modal="true" aria-label={mode === "create" ? "Add item" : "Edit item"}>
        <div className="slideover__header">
          <span className="page-title text-lg">
            {mode === "create" ? "Add item" : `Edit ${initialItem?.sku}`}
          </span>
          <button className="btn btn--ghost btn--sm" onClick={onClose} type="button">
            Close
          </button>
        </div>

        <form className="slideover__body" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="sku">SKU</label>
            <input
              id="sku"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              required
              maxLength={100}
              disabled={mode === "edit"}
            />
          </div>

          <div className="form-field">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={255}
            />
          </div>

          <div className="form-field">
            <label htmlFor="unit">Unit</label>
            <select
              id="unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value as (typeof UNIT_OPTIONS)[number])}
            >
              {UNIT_OPTIONS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="quantity">Quantity on hand</label>
            <input
              id="quantity"
              type="number"
              min={0}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="minimumStock">Minimum stock</label>
            <input
              id="minimumStock"
              type="number"
              min={0}
              value={minimumStock}
              onChange={(e) => setMinimumStock(e.target.value)}
              required
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="flex gap-2 justify-end mt-2">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn" disabled={submitting}>
              {submitting ? "Saving…" : mode === "create" ? "Add item" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
