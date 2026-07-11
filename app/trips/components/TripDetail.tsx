"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

type TripItemRow = {
  itemId: string;
  quantityTaken: number;
  quantityReturned: number;
  sku: string;
  name: string;
  unit: string;
};

type TripDetailProps = {
  trip: {
    id: string;
    status: "ACTIVE" | "COMPLETED";
    departedAt: string;
    returnedAt: string | null;
    jobReference: string | null;
    notes: string | null;
  };
  vehicle: { registration: string; name: string } | null;
  items: TripItemRow[];
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TripDetail({ trip, vehicle, items }: TripDetailProps) {
  const router = useRouter();
  const [returning, setReturning] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      items.map((item) => [
        item.itemId,
        String(item.quantityTaken - item.quantityReturned),
      ]),
    ),
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canReturn = trip.status === "ACTIVE" && items.length > 0;

  async function handleReturn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payloadItems = items.map((item) => ({
      itemId: item.itemId,
      quantityReturned: Number(quantities[item.itemId] ?? 0),
    }));

    for (const row of payloadItems) {
      const item = items.find((i) => i.itemId === row.itemId)!;
      const remaining = item.quantityTaken - item.quantityReturned;
      if (row.quantityReturned < 0 || row.quantityReturned > remaining) {
        setError(`Returned quantity for ${item.sku} must be between 0 and ${remaining}.`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/trips/return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId: trip.id, items: payloadItems }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.message ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      setReturning(false);
      router.refresh();
    } catch {
      setError("Could not reach the server. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/trips" className="btn btn--ghost btn--sm">
          ← All trips
        </Link>
      </div>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="page-title text-2xl">
            {vehicle ? vehicle.registration : "Trip"}
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--steel)" }}>
            {vehicle?.name}
          </p>
        </div>
        <span
          className={`status-badge ${
            trip.status === "ACTIVE" ? "status-badge--active" : "status-badge--completed"
          }`}
        >
          {trip.status === "ACTIVE" ? "Active" : "Completed"}
        </span>
      </div>

      <div className="detail-summary">
        <div>
          <p className="detail-summary__label">Departed</p>
          <p className="detail-summary__value">{formatDate(trip.departedAt)}</p>
        </div>
        <div>
          <p className="detail-summary__label">Returned</p>
          <p className="detail-summary__value">
            {trip.returnedAt ? formatDate(trip.returnedAt) : "—"}
          </p>
        </div>
        <div>
          <p className="detail-summary__label">Job reference</p>
          <p className="detail-summary__value">{trip.jobReference ?? "—"}</p>
        </div>
        <div>
          <p className="detail-summary__label">Notes</p>
          <p className="detail-summary__value">{trip.notes ?? "—"}</p>
        </div>
      </div>

      <div className="panel">
        <p className="panel__header">Items on this trip</p>
        {items.length === 0 ? (
          <p className="panel__empty">No items were recorded for this trip.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Name</th>
                <th>Taken</th>
                <th>Returned</th>
                <th>Remaining</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.itemId}>
                  <td className="data-table__sku">{item.sku}</td>
                  <td className="data-table__name">{item.name}</td>
                  <td>
                    {item.quantityTaken} {item.unit}
                  </td>
                  <td>
                    {item.quantityReturned} {item.unit}
                  </td>
                  <td>
                    {item.quantityTaken - item.quantityReturned} {item.unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {trip.status === "ACTIVE" && (
        <div>
          {!returning ? (
            <button
              className="btn"
              onClick={() => setReturning(true)}
              disabled={!canReturn}
              title={!canReturn ? "This trip has no items to return" : undefined}
            >
              Return trip
            </button>
          ) : (
            <div className="panel">
              <p className="panel__header">Record return</p>
              <form className="slideover__body" onSubmit={handleReturn}>
                {items.map((item) => {
                  const remaining = item.quantityTaken - item.quantityReturned;
                  return (
                    <div key={item.itemId} className="line-item-row">
                      <div className="form-field">
                        <label>
                          {item.sku} — {item.name}
                        </label>
                        <p className="line-item-row__meta">
                          {remaining} {item.unit} remaining out
                        </p>
                      </div>
                      <div className="form-field">
                        <label htmlFor={`qty-${item.itemId}`}>Returning</label>
                        <input
                          id={`qty-${item.itemId}`}
                          type="number"
                          min={0}
                          max={remaining}
                          value={quantities[item.itemId] ?? ""}
                          onChange={(e) =>
                            setQuantities((prev) => ({
                              ...prev,
                              [item.itemId]: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div />
                    </div>
                  );
                })}

                {error && <p className="form-error">{error}</p>}

                <div className="flex gap-2 justify-end mt-2">
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => setReturning(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn" disabled={submitting}>
                    {submitting ? "Completing…" : "Complete return"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
