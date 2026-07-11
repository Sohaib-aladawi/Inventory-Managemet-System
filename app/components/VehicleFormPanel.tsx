"use client";

import { useState } from "react";

export type VehicleRecord = {
  id: string;
  registration: string;
  name: string;
  type: string;
};

type VehicleFormPanelProps = {
  mode: "create" | "edit";
  initialVehicle?: VehicleRecord;
  onClose: () => void;
  onSaved: () => void;
};

export function VehicleFormPanel({
  mode,
  initialVehicle,
  onClose,
  onSaved,
}: VehicleFormPanelProps) {
  const [registration, setRegistration] = useState(initialVehicle?.registration ?? "");
  const [name, setName] = useState(initialVehicle?.name ?? "");
  const [type, setType] = useState(initialVehicle?.type ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const body = { registration, name, type };

    try {
      const res = await fetch(
        mode === "create" ? "/api/vehicles" : `/api/vehicles/${initialVehicle!.id}`,
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
      <div
        className="slideover"
        role="dialog"
        aria-modal="true"
        aria-label={mode === "create" ? "Add vehicle" : "Edit vehicle"}
      >
        <div className="slideover__header">
          <span className="page-title text-lg">
            {mode === "create" ? "Add vehicle" : `Edit ${initialVehicle?.registration}`}
          </span>
          <button className="btn btn--ghost btn--sm" onClick={onClose} type="button">
            Close
          </button>
        </div>

        <form className="slideover__body" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="registration">Registration</label>
            <input
              id="registration"
              value={registration}
              onChange={(e) => setRegistration(e.target.value)}
              required
              maxLength={100}
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
            <label htmlFor="type">Type</label>
            <input
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
              maxLength={100}
              placeholder="e.g. Van, Truck, Motorbike"
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="flex gap-2 justify-end mt-2">
            <button type="button" className="btn btn--ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn" disabled={submitting}>
              {submitting ? "Saving…" : mode === "create" ? "Add vehicle" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
