const Failure = ({ message }) => {
  return (
    <main className="grid min-h-screen place-content-center justify-items-center p-6 text-center text-slate-950">
      <p className="mb-5 text-xs font-bold uppercase tracking-[1.4px] text-emerald-700">Payment status</p>
      <div className="grid size-16 place-items-center rounded-full bg-red-700 text-3xl font-bold text-white" aria-hidden="true">!</div>
      <h1 className="my-5 text-4xl font-semibold">Payment failed</h1>
      <p className="mb-6 max-w-md text-slate-500">{message}</p>
      <button className="cursor-pointer rounded bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700" type="button" onClick={() => window.location.assign("/")}>
        Return to products
      </button>
    </main>
  );
};

export default Failure;