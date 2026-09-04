const Navbar = () => {
  return (
    <nav className="mb-8 flex flex-col items-start justify-between gap-5 border-b border-slate-200 pb-7 sm:flex-row sm:items-center sm:gap-6" aria-label="Primary navigation">
      <a className="inline-flex items-center gap-2.5 text-xl font-extrabold text-slate-950 no-underline" href="/">
        <span className="grid size-8 place-items-center rounded-lg bg-emerald-600 text-lg text-white" aria-hidden="true">P</span>
        PayStore
      </a>
      <div className="flex items-center gap-6">
        <a className="text-sm font-semibold text-emerald-700 no-underline" href="/">Products</a>
        <span className="text-[13px] font-semibold text-slate-500">eSewa + Khalti</span>
      </div>
    </nav>
  );
};

export default Navbar;