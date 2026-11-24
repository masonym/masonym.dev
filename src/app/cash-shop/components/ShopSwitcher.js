import Link from "next/link";
import { SHOPS } from "../shops";

const ShopSwitcher = ({ activeShopId }) => (
  <nav
    aria-label="Cash shop"
    className="flex flex-wrap justify-center gap-2 mt-16 mb-3 px-4"
  >
    {Object.values(SHOPS).map((shop) => {
      const active = shop.id === activeShopId;
      return (
        <Link
          key={shop.id}
          href={shop.href}
          aria-current={active ? "page" : undefined}
          className={`
            px-5 py-2 text-sm font-bold text-center border-2 rounded-full
            transition-all duration-300 hover:scale-105
            ${
              active
                ? "bg-[#5a8859] text-white border-[#4a7749] shadow-md"
                : "bg-[#8abf88] text-[#2e4d2e] border-[#d2b48c] hover:bg-[#6fa96d]"
            }
          `}
        >
          {shop.name}
        </Link>
      );
    })}
  </nav>
);

export default ShopSwitcher;
