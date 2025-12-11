import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-center space-y-24 animate-in fade-in zoom-in duration-500 py-20 pb-40">

      {/* Hero Section */}
      <div className="space-y-12 max-w-5xl mx-auto px-4 w-full">
        <div className="relative inline-block">
          <h1 className="text-6xl md:text-[10rem] font-black tracking-tighter leading-none select-none text-foreground">
            K4CUT
          </h1>
          <div className="absolute -bottom-4 md:-bottom-8 left-0 w-full h-1 md:h-2 bg-foreground"></div>
        </div>

        <div className="space-y-6 pt-8">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            당신의 순간, AI가 그리다.
          </h2>
          <p className="text-lg md:text-xl font-light text-secondary mx-auto tracking-wide leading-relaxed keep-all max-w-4xl">
            스튜디오에 가지 않아도 괜찮습니다.<br className="block md:hidden cr-mobile-break" />
            내 사진을 업로드하고<br className="block md:hidden" /> 원하는 포즈 테마를 선택하세요.
            <br className="hidden md:block" />
            <span className="block h-4 md:hidden" />
            최신 AI 기술이 당신의 이미지를 분석하여<br className="block md:hidden" />
            자연스럽고 개성 넘치는<br className="block md:hidden" /> 네컷사진을 생성해 드립니다.
          </p>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-[80%] sm:w-full max-w-md mx-auto">
        <Link
          href="/create"
          className="btn-primary text-center py-4 md:py-5 text-base md:text-lg flex-1 shadow-none transition-all hover:bg-secondary/10 hover:text-primary border hover:border-primary"
        >
          START NOW
        </Link>
        <Link
          href="/gallery"
          className="btn-secondary text-center py-4 md:py-5 text-base md:text-lg flex-1"
        >
          GALLERY
        </Link>
      </div>

      {/* How it Works Section */}
      <div className="w-full container-custom mt-20">
        <div className="border-t border-b border-border py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-left">
            <div className="space-y-4">
              <span className="text-5xl font-black text-primary">01</span>
              <div>
                <h4 className="font-bold text-xl mb-2">UPLOAD</h4>
                <p className="text-sm text-secondary break-keep">얼굴이 잘 나온 사진을 업로드하세요.</p>
              </div>
            </div>
            <div className="space-y-4">
              <span className="text-5xl font-black text-primary">02</span>
              <div>
                <h4 className="font-bold text-xl mb-2">SELECT</h4>
                <p className="text-sm text-secondary break-keep">원하는 분위기와 포즈 테마를 선택하세요.</p>
              </div>
            </div>
            <div className="space-y-4">
              <span className="text-5xl font-black text-primary">03</span>
              <div>
                <h4 className="font-bold text-xl mb-2">GENERATE</h4>
                <p className="text-sm text-secondary break-keep">AI가 당신을 주인공으로 한 네 컷 사진을 생성합니다.</p>
              </div>
            </div>
            <div className="space-y-4">
              <span className="text-5xl font-black text-primary">04</span>
              <div>
                <h4 className="font-bold text-xl mb-2">KEEP</h4>
                <p className="text-sm text-secondary break-keep">완성된 사진을 다운로드하고 공유하세요.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="max-w-3xl mx-auto px-4 text-xs text-secondary/40 break-keep">
        <p>
          "K4CUT은 AI 이미지 생성을 위해 사용자의 사진을 활용합니다. 업로드된 사진은 이미지 생성 목적 이외에는 사용되지 않으며, 타인의 사진을 무단으로 사용할 경우 법적 책임은 사용자에게 있습니다."
        </p>
      </div>
    </div>
  );
}
