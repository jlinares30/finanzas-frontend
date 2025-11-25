export default function Card({ children }) {
  return (
    <div className="border p-4 rounded shadow-sm w-full max-w-xl mx-auto">
      {children}
    </div>
  );
}
