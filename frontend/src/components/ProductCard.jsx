const ProductCard = ({ product, onBuy }) => {
  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <img className="block aspect-[4/3] w-full bg-slate-100 object-cover" src={product.thumbnail} alt={product.title} />

      <div className="p-[18px]">
        <h2 className="mb-2 text-xl font-semibold leading-tight text-slate-950">{product.title}</h2>

        <p className="line-clamp-2 min-h-12 text-sm text-slate-500">{product.description}</p>

        <h3 className="mt-4 text-xl font-bold text-emerald-700">${product.price}</h3>

        <button className="mt-4 cursor-pointer rounded bg-emerald-600 px-3.5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700" onClick={() => onBuy(product)}>Buy Now</button>
      </div>
    </article>
  );
};

export default ProductCard;
