export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-pulse rounded-2xl bg-accent/15" />
        <p className="mt-4 text-sm tracking-[0.16em] text-ink-muted uppercase">
          拓維空間NovaDimension
        </p>
      </div>
    </div>
  );
}
