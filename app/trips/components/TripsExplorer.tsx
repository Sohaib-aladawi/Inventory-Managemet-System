"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { StartTripPanel } from "./StartTripPanel";

export type TripRow = {
  id: string;
  vehicleId: string;
  status: "ACTIVE" | "COMPLETED";
  departedAt: string;
  returnedAt: string | null;
  jobReference: string | null;
  notes: string | null;
  vehicleRegistration: string;
  vehicleName: string;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TripsExplorer({ initialTrips }: { initialTrips: TripRow[] }) {
  const [trips, setTrips] = useState<TripRow[]>(initialTrips);
  const [tab, setTab] = useState<"ACTIVE" | "COMPLETED">("ACTIVE");
  const [showStartPanel, setShowStartPanel] = useState(false);

  const filtered = useMemo(
    () => trips.filter((trip) => trip.status === tab),
    [trips, tab],
  );

  const activeVehicleIds = useMemo(
    () => new Set(trips.filter((t) => t.status === "ACTIVE").map((t) => t.vehicleId)),
    [trips],
  );

  async function refresh() {
    const res = await fetch("/api/trips");
    if (res.ok) {
      setTrips(await res.json());
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="page-title text-2xl">Trips</h1>
          <p className="text-sm mt-1" style={{ color: "var(--steel)" }}>
            Vehicle dispatch — from departure to return.
          </p>
        </div>
        <button className="btn" onClick={() => setShowStartPanel(true)}>
          Start trip
        </button>
      </div>

      <div className="tab-bar">
        <button aria-selected={tab === "ACTIVE"} onClick={() => setTab("ACTIVE")}>
          Active
        </button>
        <button aria-selected={tab === "COMPLETED"} onClick={() => setTab("COMPLETED")}>
          History
        </button>
      </div>

      <div className="panel">
        {filtered.length === 0 ? (
          <p className="panel__empty">
            {tab === "ACTIVE" ? "No active trips right now." : "No completed trips yet."}
          </p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Job ref</th>
                <th>Departed</th>
                <th>{tab === "ACTIVE" ? "Status" : "Returned"}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((trip) => (
                <tr key={trip.id}>
                  <td>
                    <span className="data-table__sku">{trip.vehicleRegistration}</span>
                    <span className="data-table__name" style={{ marginLeft: "0.5rem" }}>
                      {trip.vehicleName}
                    </span>
                  </td>
                  <td className="data-table__name">{trip.jobReference ?? "—"}</td>
                  <td>{formatDate(trip.departedAt)}</td>
                  <td>
                    {tab === "ACTIVE" ? (
                      <span className="status-badge status-badge--active">Active</span>
                    ) : trip.returnedAt ? (
                      formatDate(trip.returnedAt)
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    <div className="data-table__actions">
                      <Link href={`/trips/${trip.id}`} className="btn btn--ghost btn--sm">
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showStartPanel && (
        <StartTripPanel
          occupiedVehicleIds={activeVehicleIds}
          onClose={() => setShowStartPanel(false)}
          onSaved={() => {
            setShowStartPanel(false);
            refresh();
          }}
        />
      )}
    </div>
  );
}
