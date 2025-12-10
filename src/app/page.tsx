import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-center space-y-20 animate-in fade-in zoom-in duration-500 py-20">

      {/* Hero Section */}
      <div className="space-y-8 max-w-4xl mx-auto px-4">
        <div className="relative inline-block">
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-none select-none">
            K4CUT
          </h1>
          <div className="absolute -bottom-2 md:-bottom-4 left-0 w-full h-1 md:h-2 bg-foreground"></div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight">
            "당신의 순간, AI가 그리다."
          </h2>
          <p className="text-lg md:text-xl font-light text-secondary mx-auto tracking-wide leading-relaxed break-keep">
            스튜디오에 가지 않아도 괜찮습니다. 내 사진을 업로드하고 원하는 포즈 테마를 선택하세요.<br className="hidden md:block" />
            최신 AI 기술이 당신의 이미지를 분석하여 자연스럽고 개성 넘치는 4분할 사진을 즉시 생성해 드립니다.
          </p>
        </div>
      </div>

      {/* CTA Buttons */}
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

      {/* How it Works Section */}
      <div className="w-full max-w-5xl mx-auto px-4 mt-12">
        <h3 className="text-2xl font-bold mb-10 tracking-widest border-b border-foreground/10 pb-4 inline-block">HOW IT WORKS</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-left">
          <div className="space-y-2 p-4 border border-foreground/5 hover:border-foreground/20 transition-colors bg-secondary/5">
            <h4 className="font-black text-xl">01. Upload</h4>
            <p className="text-sm text-secondary break-keep">얼굴이 잘 나온 사진을 업로드하세요.</p>
          </div>
          <div className="space-y-2 p-4 border border-foreground/5 hover:border-foreground/20 transition-colors bg-secondary/5">
            <h4 className="font-black text-xl">02. Select</h4>
            <p className="text-sm text-secondary break-keep">원하는 분위기와 포즈 테마를 선택하세요.</p>
          </div>
          <div className="space-y-2 p-4 border border-foreground/5 hover:border-foreground/20 transition-colors bg-secondary/5">
            <h4 className="font-black text-xl">03. Generate</h4>
            <p className="text-sm text-secondary break-keep">AI가 당신을 주인공으로 한 네 컷 사진을 생성합니다.</p>
          </div>
          <div className="space-y-2 p-4 border border-foreground/5 hover:border-foreground/20 transition-colors bg-secondary/5">
            <h4 className="font-black text-xl">04. Keep</h4>
            <p className="text-sm text-secondary break-keep">완성된 사진을 다운로드하고 공유하세요.</p>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="max-w-3xl mx-auto px-4 mt-20 text-xs text-secondary/50 break-keep border-t border-foreground/5 pt-8">
        <p>
          "K-4CUT은 AI 이미지 생성을 위해 사용자의 사진을 활용합니다. 업로드된 사진은 이미지 생성 목적 이외에는 사용되지 않으며, 타인의 사진을 무단으로 사용할 경우 법적 책임을 질 수 있습니다."
        </p>
      </div>
    </div>
  );
}
