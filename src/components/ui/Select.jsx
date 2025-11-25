export default function Select({ label, children, ...props }) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <label className="text-sm">{label}</label>
      <select
        {...props}
        className="border rounded px-2 py-1 text-sm"
      >
        {children}
      </select>
    </div>
  );
}
