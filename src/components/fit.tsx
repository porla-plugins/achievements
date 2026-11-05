import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

export function Fit({
  width,
  max,
  children,
}: {
  width: number;
  max: number;
  children: ReactNode;
}) {
  const outer = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);

  useLayoutEffect(() => {
    const el = outer.current!;
    const fit = () => setZoom(Math.min(max, el.clientWidth) / width);
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [width, max]);

  return (
    <div ref={outer} className="w-full">
      <div className="mx-auto" style={{ width, zoom }}>
        {children}
      </div>
    </div>
  );
}
