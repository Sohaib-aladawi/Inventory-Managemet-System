import { TableSkeleton } from "../components/TableSkeleton";

export default function TripsLoading() {
  return <TableSkeleton columns={5} withTabs />;
}
