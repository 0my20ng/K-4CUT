import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-center space-y-12 animate-in fade-in zoom-in duration-500">
      <div className="space-y-6">
        <div className="relative inline-block">
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-none select-none">
            K4CUT
          </h1>
          <div className="absolute -bottom-2 md:-bottom-4 left-0 w-full h-1 md:h-2 bg-foreground"></div>
        </div>
        <p className="text-lg md:text-2xl font-light text-secondary max-w-xl mx-auto tracking-wide leading-relaxed">
          Capture the moment. Reimagined by AI.
          <br />
          <span className="font-medium text-foreground">Four frames. One story.</span>
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm mx-auto">
        <Link
          href="/create"
          className="btn-primary text-center py-4 text-base tracking-[0.2em] font-bold hover:scale-105 transition-transform duration-300"
        >
          START NOW
        </Link>
        <Link
          href="/gallery"
          className="btn-secondary text-center py-4 text-base tracking-[0.2em] font-bold hover:scale-105 transition-transform duration-300"
        >
          GALLERY
        </Link>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-20 pointer-events-none">
        <div className="flex gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="w-16 h-24 border border-foreground/50"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
