export default function Select({ label, children, ...props }) {
  return (
    <div className="flex flex-col mb-4 w-full">
      <label className="text-sm font-medium mb-2 text-gray-700">{label}</label>
      <select
        {...props}
        className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white hover:border-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed cursor-pointer"
      >
        {children}
      </select>
    </div>
  );
}