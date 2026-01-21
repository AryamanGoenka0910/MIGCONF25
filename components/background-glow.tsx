import { useState, useEffect } from "react";

function cn(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(" ");
}

function useReducedMotion() {
    const [reduced, setReduced] = useState(false);
    useEffect(() => {
      const media = window.matchMedia("(prefers-reduced-motion: reduce)");
      const handler = () => setReduced(media.matches);
      handler();
      media.addEventListener?.("change", handler);
      return () => media.removeEventListener?.("change", handler);
    }, []);
    return reduced;
  }

function BackgroundGlow() {
    const reduced = useReducedMotion();

    return (
        <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_55%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:60px_60px] opacity-[0.08]" />
            <div
                className={cn(
                    "absolute -top-44 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full blur-3xl bg-primary/14",
                    !reduced && "animate-[pulse_6s_ease-in-out_infinite]"
                )}
            />
            <div
                className={cn(
                    "absolute -bottom-44 right-[-120px] h-[560px] w-[560px] rounded-full blur-3xl bg-secondary/14",
                    !reduced && "animate-[pulse_7s_ease-in-out_infinite]"
                )}
            />
        </div>
    )
}

export default BackgroundGlow;