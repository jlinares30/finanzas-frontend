export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-green-100 p-4">
      <div className="max-w-3xl mx-auto">{children}</div>
    </div>
  );
}
