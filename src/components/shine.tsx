export function Shine() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px]"
    >
      <div className="absolute inset-y-0 -left-1/2 w-1/3 bg-linear-to-r from-transparent via-white/15 to-transparent opacity-0 motion-safe:animate-[stats-shine_1.4s_ease-out_0.3s_both]" />
    </div>
  );
}
