export default function Input({ label, ...props }) {
  return (
    <div className="flex flex-col mb-2">
      <label className="text-sm mb-1 text-gray-600">{label}</label>
      <input
        className="border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400"
        {...props}
      />
    </div>
  );
}
