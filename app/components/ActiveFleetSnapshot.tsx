type ActiveTripRow = {
  id: string;
  vehicleRegistration: string;
  vehicleName: string;
  jobReference: string | null;
};

export function ActiveFleetSnapshot({ trips }: { trips: ActiveTripRow[] }) {
  if (trips.length === 0) {
    return (
      <div className="panel">
        <p className="panel__header">Fleet snapshot</p>
        <p className="panel__empty">No vehicles out right now.</p>
      </div>
    );
  }

  return (
    <div className="panel">
      <p className="panel__header">
        Fleet snapshot — {trips.length} out
      </p>
      <div>
        {trips.map((trip) => (
          <div key={trip.id} className="manifest-row manifest-row--3col">
            <span className="manifest-row__flag manifest-row__flag--active" />
            <span>
              <span className="manifest-row__primary">{trip.vehicleRegistration}</span>
              <span className="manifest-row__secondary"> — {trip.vehicleName}</span>
            </span>
            <span className="manifest-row__meta">{trip.jobReference ?? "—"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
