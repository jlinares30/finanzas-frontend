export default function Button({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={`px-4 py-2 rounded text-sm text-white ${className || "bg-green-600"}`}
    >
      {children}
    </button>
  );
}
