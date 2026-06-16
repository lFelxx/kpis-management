import { useEffect, useRef } from "react";

interface StarFieldProps {
  count?: number;
}

export function StarField({ count = 160 }: StarFieldProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const stars: HTMLDivElement[] = [];
    for (let i = 0; i < count; i++) {
      const s = document.createElement("div");
      const size = Math.random() * 1.8 + 0.2;
      s.style.cssText = `
        position:absolute;
        background:white;
        border-radius:50%;
        width:${size}px;
        height:${size}px;
        left:${Math.random() * 100}%;
        top:${Math.random() * 100}%;
        animation:sf-twinkle ${Math.random() * 5 + 3}s ${Math.random() * 8}s infinite ease-in-out;
      `;
      el.appendChild(s);
      stars.push(s);
    }

    return () => stars.forEach((s) => el.removeChild(s));
  }, [count]);

  return (
    <>
      <style>{`
        @keyframes sf-twinkle {
          0%,100% { opacity:.10; transform:scale(1); }
          50%      { opacity:.55; transform:scale(1.15); }
        }
      `}</style>
      <div
        ref={ref}
        className="fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, #141414 0%, #000 100%)",
        }}
        aria-hidden="true"
      />
    </>
  );
}
