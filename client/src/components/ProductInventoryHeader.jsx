// src/components/ProductInventoryHeader.jsx
export default function ProductInventoryHeader({ total, onAdd }) {
  return (
    <div className="bg-white rounded-xl shadow flex items-center justify-between px-8 py-6 mb-8">
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <span className="text-blue-600 text-3xl mr-3 flex-shrink-0">
          {/* Outline inventory box icon */}
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
            <rect x="3" y="7" width="18" height="10" rx="2" stroke="#2563eb" strokeWidth="2"/>
            <path stroke="#2563eb" strokeWidth="2" d="M7 17v2a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2"/>
          </svg>
        </span>
        <div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900">Product Inventory</div>
          {/* <div className="text-gray-500 mt-1 text-sm">Total products: <span className="font-semibold text-gray-900">{total}</span></div> */}
        </div>
      </div>
      <button
        onClick={onAdd}
        className="bg-blue-600 hover:bg-blue-700 transition text-white text-base font-medium rounded-lg px-8 py-3 flex items-center shadow"
      >
        <span className="text-2xl mr-2">+</span>
        Add New Product
      </button>
    </div>
  );
}
