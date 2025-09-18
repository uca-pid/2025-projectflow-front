export default function WonderlandBackground({
  children,
  centered = false,
  opacity = 1,
}: {
  children: React.ReactNode;
  centered?: boolean;
  opacity?: number;
}) {
  return (
    <div className={opacity === 1 ? "" : "opacity-" + opacity * 100}>
      <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
        {/* Background pattern and decorative elements */}
        <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
        <div className="absolute top-10 left-10 w-64 h-64 bg-blue-400/30 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-1/4 right-10 w-80 h-80 bg-purple-400/25 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-pink-400/30 rounded-full blur-2xl animate-pulse delay-700"></div>
        <div className="absolute bottom-10 right-1/3 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-300/15 rounded-full blur-3xl animate-pulse delay-300"></div>

        {/* Decorative lines and shapes */}
        <div className="absolute top-1/3 left-1/4 w-4 h-32 bg-blue-500/40 rounded-full rotate-45"></div>
        <div className="absolute top-2/3 right-1/4 w-3 h-28 bg-purple-500/35 rounded-full -rotate-12"></div>
        <div className="absolute bottom-1/3 left-1/3 w-2 h-20 bg-pink-500/40 rounded-full rotate-12"></div>
        <div className="absolute top-20 right-20 w-3 h-24 bg-indigo-500/30 rounded-full -rotate-45"></div>
        <div className="absolute top-1/4 left-1/2 w-20 h-20 border-2 border-blue-400/30 rounded-full animate-spin-slow"></div>
        <div className="absolute bottom-1/4 right-1/2 w-16 h-16 border border-purple-400/40 rounded-lg rotate-45 animate-pulse delay-200"></div>

        {/* Content container - conditional centering */}
        {centered ? (
          <div className="relative z-10 w-full flex items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-md">
              <div className="absolute inset-0 rounded-3xl scale-110 shadow-2xl"></div>
              <div className="absolute inset-0 rounded-3xl scale-105"></div>
              <div className="relative">{children}</div>
            </div>
          </div>
        ) : (
          <div className="relative z-10 w-full min-h-screen">{children}</div>
        )}
      </div>
    </div>
  );
}
