import AuthRightPanel from "./AuthRightPanel";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-gray-50">
      {/* Left side — auth form */}
      <div className="flex flex-col justify-center items-center min-h-screen px-6 py-12 lg:px-16 bg-white">
        <div className="w-full max-w-md">{children}</div>
      </div>

      {/* Right side — floating panel, hidden on mobile */}
      <div className="hidden lg:flex items-stretch bg-white py-6 pr-6">
        <div className="flex-1 bg-auth-accent rounded-2xl overflow-hidden">
          <AuthRightPanel />
        </div>
      </div>
    </main>
  );
}
