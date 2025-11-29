export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-green-50 p-6">
      <div className="w-full px-4">{children}</div>
    </div>
  );
}