export default function Card({ children }) {
  return (
    <div className="border border-gray-200 p-6 rounded-xl shadow-lg hover:shadow-xl bg-white w-full max-w-xl mx-auto transition-shadow duration-300">
      {children}
    </div>
  );
}