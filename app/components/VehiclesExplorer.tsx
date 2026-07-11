"use client";

import { useMemo, useState } from "react";
import { VehicleFormPanel, type VehicleRecord } from "./VehicleFormPanel";

export function VehiclesExplorer({ initialVehicles }: { initialVehicles: VehicleRecord[] }) {
  const [vehicles, setVehicles] = useState<VehicleRecord[]>(initialVehicles);
  const [search, setSearch] = useState("");
  const [panel, setPanel] = useState<
    { mode: "create" } | { mode: "edit"; vehicle: VehicleRecord } | null
  >(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return vehicles;
    return vehicles.filter(
      (v) =>
        v.registration.toLowerCase().includes(query) ||
        v.name.toLowerCase().includes(query) ||
        v.type.toLowerCase().includes(query),
    );
  }, [vehicles, search]);

  async function refresh() {
    const res = await fetch("/api/vehicles");
    if (res.ok) {
      setVehicles(await res.json());
    }
  }

  async function handleDelete(vehicle: VehicleRecord) {
    setActionError(null);
    if (!confirm(`Delete vehicle ${vehicle.registration}? This cannot be undone.`)) return;

    const res = await fetch(`/api/vehicles/${vehicle.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setActionError(data?.message ?? `Could not delete ${vehicle.registration}.`);
      return;
    }
    setVehicles((prev) => prev.filter((v) => v.id !== vehicle.id));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="page-title text-2xl">Vehicles</h1>
          <p className="text-sm mt-1" style={{ color: "var(--steel)" }}>
            Transport assets used for deliveries and site visits.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            className="search-input"
            placeholder="Search registration, name, type…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search vehicles"
          />
          <button className="btn" onClick={() => setPanel({ mode: "create" })}>
            Add vehicle
          </button>
        </div>
      </div>

      {actionError && <p className="form-error">{actionError}</p>}

      <div className="panel">
        {filtered.length === 0 ? (
          <p className="panel__empty">
            {vehicles.length === 0 ? "No vehicles yet." : "No vehicles match that search."}
          </p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Registration</th>
                <th>Name</th>
                <th>Type</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((vehicle) => (
                <tr key={vehicle.id}>
                  <td className="data-table__sku">{vehicle.registration}</td>
                  <td className="data-table__name">{vehicle.name}</td>
                  <td className="data-table__name">{vehicle.type}</td>
                  <td>
                    <div className="data-table__actions">
                      <button
                        className="btn btn--ghost btn--sm"
                        onClick={() => setPanel({ mode: "edit", vehicle })}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn--rust btn--sm"
                        onClick={() => handleDelete(vehicle)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {panel && (
        <VehicleFormPanel
          mode={panel.mode}
          initialVehicle={panel.mode === "edit" ? panel.vehicle : undefined}
          onClose={() => setPanel(null)}
          onSaved={() => {
            setPanel(null);
            refresh();
          }}
        />
      )}
    </div>
  );
}
