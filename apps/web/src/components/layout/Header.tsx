export function Header() {
  return (
    <header className="border-b border-slate-800 bg-slate-950 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-amber-400">
            CoffeeHQ
          </p>
          <h2 className="text-xl font-semibold">Claims workspace</h2>
        </div>

        <div className="text-right">
          <p className="text-sm font-medium">Peter Lill</p>
          <p className="text-xs text-slate-400">Claims Representative</p>
        </div>
      </div>
    </header>
  );
}
