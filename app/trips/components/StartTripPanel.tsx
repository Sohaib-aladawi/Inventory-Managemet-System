"use client";

import { useEffect, useState } from "react";

type Vehicle = { id: string; registration: string; name: string };
type Item = { id: string; sku: string; name: string; unit: string; quantity: number };

type LineItem = { itemId: string; quantityTaken: string };

type StartTripPanelProps = {
  occupiedVehicleIds: Set<string>;
  onClose: () => void;
  onSaved: () => void;
};

export function StartTripPanel({ occupiedVehicleIds, onClose, onSaved }: StartTripPanelProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const [vehicleId, setVehicleId] = useState("");
  const [jobReference, setJobReference] = useState("");
  const [notes, setNotes] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      const [vehiclesRes, itemsRes] = await Promise.all([
        fetch("/api/vehicles"),
        fetch("/api/items"),
      ]);
      if (vehiclesRes.ok) setVehicles(await vehiclesRes.json());
      if (itemsRes.ok) setItems(await itemsRes.json());
      setLoading(false);
    }
    load();
  }, []);

  const availableVehicles = vehicles.filter((v) => !occupiedVehicleIds.has(v.id));

  function addLineItem() {
    setLineItems((prev) => [...prev, { itemId: "", quantityTaken: "1" }]);
  }

  function updateLineItem(index: number, patch: Partial<LineItem>) {
    setLineItems((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function removeLineItem(index: number) {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  }

  function stockFor(itemId: string) {
    return items.find((i) => i.id === itemId)?.quantity ?? 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!vehicleId) {
      setError("Select a vehicle.");
      return;
    }

    const payloadItems = lineItems
      .filter((row) => row.itemId)
      .map((row) => ({ itemId: row.itemId, quantityTaken: Number(row.quantityTaken) }));

    for (const row of payloadItems) {
      if (!row.quantityTaken || row.quantityTaken < 1) {
        setError("Every item needs a quantity of at least 1.");
        return;
      }
      if (row.quantityTaken > stockFor(row.itemId)) {
        setError("One or more quantities exceed available stock.");
        return;
      }
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/trips/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId,
          jobReference: jobReference || undefined,
          notes: notes || undefined,
          items: payloadItems,
        }),
      });

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

  const selectedItemIds = new Set(lineItems.map((r) => r.itemId).filter(Boolean));

  return (
    <>
      <div className="slideover-backdrop" onClick={onClose} />
      <div className="slideover" role="dialog" aria-modal="true" aria-label="Start trip">
        <div className="slideover__header">
          <span className="page-title text-lg">Start trip</span>
          <button className="btn btn--ghost btn--sm" onClick={onClose} type="button">
            Close
          </button>
        </div>

        {loading ? (
          <p className="panel__empty">Loading…</p>
        ) : (
          <form className="slideover__body" onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="vehicle">Vehicle</label>
              <select
                id="vehicle"
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                required
              >
                <option value="" disabled>
                  Select a vehicle
                </option>
                {availableVehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.registration} — {v.name}
                  </option>
                ))}
              </select>
              {availableVehicles.length === 0 && (
                <p className="line-item-row__meta">
                  Every vehicle already has an active trip.
                </p>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="jobReference">Job reference (optional)</label>
              <input
                id="jobReference"
                value={jobReference}
                onChange={(e) => setJobReference(e.target.value)}
                maxLength={255}
                placeholder="e.g. JOB-2045"
              />
            </div>

            <div className="form-field">
              <label htmlFor="notes">Notes (optional)</label>
              <input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={1000}
              />
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label style={{ fontFamily: "var(--font-barlow-condensed)", textTransform: "uppercase", letterSpacing: "0.05em", fontSize: "0.72rem", color: "var(--steel)" }}>
                  Items taken (optional)
                </label>
                <button type="button" className="btn btn--ghost btn--sm" onClick={addLineItem}>
                  + Add item
                </button>
              </div>

              {lineItems.map((row, index) => {
                const stock = row.itemId ? stockFor(row.itemId) : null;
                return (
                  <div key={index} className="line-item-row">
                    <div className="form-field">
                      <select
                        value={row.itemId}
                        onChange={(e) => updateLineItem(index, { itemId: e.target.value })}
                        required
                      >
                        <option value="" disabled>
                          Select an item
                        </option>
                        {items
                          .filter((i) => i.id === row.itemId || !selectedItemIds.has(i.id))
                          .map((i) => (
                            <option key={i.id} value={i.id}>
                              {i.sku} — {i.name}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div className="form-field">
                      <input
                        type="number"
                        min={1}
                        max={stock ?? undefined}
                        value={row.quantityTaken}
                        onChange={(e) =>
                          updateLineItem(index, { quantityTaken: e.target.value })
                        }
                        required
                      />
                    </div>
                    <button
                      type="button"
                      className="btn btn--rust btn--sm"
                      onClick={() => removeLineItem(index)}
                    >
                      Remove
                    </button>
                    {stock !== null && (
                      <p className="line-item-row__meta" style={{ gridColumn: "1 / -1" }}>
                        {stock} in stock
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {error && <p className="form-error">{error}</p>}

            <div className="flex gap-2 justify-end mt-2">
              <button type="button" className="btn btn--ghost" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn" disabled={submitting}>
                {submitting ? "Starting…" : "Start trip"}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
