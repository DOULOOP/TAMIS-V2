import LoginForm from "@/components/auth/LoginForm";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src="/TAMISLOGO.png"
            alt="TAMIS Logo"
            className="h-20 w-auto mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            TAMIS
          </h1>
          <p className="text-gray-600">
            Tehlike Anında Mühedale İzleme Sistemi
          </p>
          <p className="text-sm text-gray-500">
            Instant Hazard Engineering Monitoring System
          </p>
        </div>
        
        <div className="bg-white shadow-xl rounded-lg p-8">
          <LoginForm />
        </div>
        
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>© 2025 TAMIS - Tüm hakları saklıdır</p>
        </div>
      </div>
    </div>
  );
}
