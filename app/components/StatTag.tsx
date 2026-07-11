type StatTagProps = {
  label: string;
  value: number;
  tone?: "default" | "amber" | "rust" | "teal";
};

export function StatTag({ label, value, tone = "default" }: StatTagProps) {
  return (
    <div className={`stat-tag ${tone !== "default" ? `stat-tag--${tone}` : ""}`}>
      <p className="stat-tag__label">{label}</p>
      <p className="stat-tag__value">{value}</p>
    </div>
  );
}
