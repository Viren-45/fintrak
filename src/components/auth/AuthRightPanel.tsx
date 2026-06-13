import Image from "next/image";

export default function AuthRightPanel() {
  return (
    <div className="flex flex-col justify-between h-full bg-auth-accent p-10 text-white overflow-hidden relative">
      {/* Background decoration circles */}
      <div className="absolute top-[-80px] right-[-80px] w-72 h-72 rounded-full bg-white/5" />
      <div className="absolute bottom-[-60px] left-[-60px] w-56 h-56 rounded-full bg-white/5" />
      <div className="absolute top-1/2 right-[-40px] w-40 h-40 rounded-full bg-white/5" />

      {/* Top — headline and subheading */}
      <div className="relative z-10 space-y-2 py-6 text-center">
        <h3 className="text-4xl font-bold leading-tight">
          Take control of your finances
        </h3>
        <p className="text-white/70 text-lg">
          Track expenses, set goals, and get AI-powered insights — all in one
          place.
        </p>
      </div>

      {/* Middle — centered image */}
      <div className="relative z-10 flex justify-center items-center py-2">
        <div className="w-[80%] rounded-2xl overflow-hidden shadow-2xl">
          <Image
            src="/assets/auth-panel.png"
            alt="Fintrak dashboard preview"
            width={600}
            height={500}
            className="w-full h-auto object-cover"
            priority
          />
        </div>
      </div>

      {/* Bottom — tagline */}
      <div className="relative z-10 text-center">
        <p className="text-white/60 text-sm">
          Join thousands of people who trust Fintrak to manage their finances
          smarter.
        </p>
      </div>
    </div>
  );
}
