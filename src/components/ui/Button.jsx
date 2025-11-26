export default function Button({ children, ...props }) {
  return (
    <button
      {...props}
      className="bg-green-600 text-white px-4 py-2 rounded text-sm"
    >
      {children}
    </button>
  );
}
