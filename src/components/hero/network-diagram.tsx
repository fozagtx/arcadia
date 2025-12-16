"use client";

import Image from "next/image";

const pills = {
  left: [
    "TikTok UGC Hook",
    "Problem / Pain Point",
    "Key Benefit",
    "Social Proof",
  ],
  right: [
    "Scroll + X402 Ready",
    "Creator Brief",
    "Platform Variants",
    "Call to Action",
  ],
};

export function NetworkDiagram() {
  return (
    <div className="relative mx-auto mt-16 flex max-w-5xl items-center justify-center">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[420px] bg-[radial-gradient(circle_at_bottom,_#000000_0,_#8B0000_30%,_#FF4500_55%,_#FFD700_75%,_transparent_90%)] opacity-95" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[260px] bg-[linear-gradient(to_right,_rgba(0,0,0,0.9)_0,_rgba(0,0,0,0.9)_6%,_rgba(0,0,0,0)_8%,_rgba(0,0,0,0)_12%,_rgba(0,0,0,0.9)_14%,_rgba(0,0,0,0.9)_20%,_rgba(0,0,0,0)_22%,_rgba(0,0,0,0)_26%,_rgba(0,0,0,0.9)_28%,_rgba(0,0,0,0.9)_34%,_rgba(0,0,0,0)_36%,_rgba(0,0,0,0)_40%,_rgba(0,0,0,0.9)_42%,_rgba(0,0,0,0.9)_48%,_rgba(0,0,0,0)_50%,_rgba(0,0,0,0)_54%,_rgba(0,0,0,0.9)_56%,_rgba(0,0,0,0.9)_62%,_rgba(0,0,0,0)_64%,_rgba(0,0,0,0)_68%,_rgba(0,0,0,0.9)_70%,_rgba(0,0,0,0.9)_76%,_rgba(0,0,0,0)_78%,_rgba(0,0,0,0)_82%,_rgba(0,0,0,0.9)_84%,_rgba(0,0,0,0.9)_90%,_rgba(0,0,0,0)_92%)]" />

      <div className="relative flex w-full items-center justify-between px-6">
        <div className="flex flex-1 flex-col items-start gap-4">
          {pills.left.map((label, index) => (
            <div
              key={label}
              className="relative flex items-center gap-3 animate-in fade-in slide-in-from-left-4 fill-mode-forwards"
              style={{ animationDelay: `${(index + 1) * 150}ms`, animationDuration: '500ms' }}
            >
              <span className="h-[2px] w-10 rounded-full bg-gray-300" />
              <div className="rounded-md bg-black px-3 py-1.5 text-xs font-semibold tracking-wide text-white shadow-[0_2px_8px_rgba(0,0,0,0.35)]">
                {label}
              </div>
            </div>
          ))}
        </div>

        <div className="relative z-10 mx-6 flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 via-gray-300 to-gray-600 shadow-[0_24px_60px_rgba(0,0,0,0.55)]">
          <div className="relative h-32 w-32 overflow-hidden rounded-full bg-black/5">
            <Image
              src="/img.jpeg"
              alt="Example TikTok ad preview"
              fill
              priority
              className="object-cover"
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col items-end gap-4">
          {pills.right.map((label, index) => (
            <div
              key={label}
              className="relative flex items-center gap-3 animate-in fade-in slide-in-from-right-4 fill-mode-forwards"
              style={{ animationDelay: `${(index + 1) * 150}ms`, animationDuration: '500ms' }}
            >
              <div className="rounded-md bg-black px-3 py-1.5 text-xs font-semibold tracking-wide text-white shadow-[0_2px_8px_rgba(0,0,0,0.35)]">
                {label}
              </div>
              <span className="h-[2px] w-10 rounded-full bg-gray-300" />
            </div>
          ))}
        </div>

        <svg
          className="pointer-events-none absolute inset-x-0 top-1/2 z-0 h-72 w-full -translate-y-1/2 text-gray-300"
          viewBox="0 0 800 300"
          preserveAspectRatio="none"
        >
          <g
            className="[&_path]:stroke-current [&_path]:stroke-[1.8] [&_path]:fill-none [&_path]:drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]"
          >
            <path d="M80 40 C 220 120, 360 130, 400 150" />
            <path d="M80 100 C 230 150, 360 160, 400 160" />
            <path d="M80 160 C 240 180, 360 185, 400 170" />
            <path d="M80 220 C 250 220, 360 210, 400 180" />

            <path d="M720 40 C 580 120, 440 130, 400 150" />
            <path d="M720 100 C 570 150, 440 160, 400 160" />
            <path d="M720 160 C 560 180, 440 185, 400 170" />
            <path d="M720 220 C 550 220, 440 210, 400 180" />
          </g>
        </svg>
      </div>
    </div>
  );
}
