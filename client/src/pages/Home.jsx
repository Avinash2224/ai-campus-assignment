import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import axios from "axios";

export default function Home() {
  // Navbar menu state (for mobile)
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // Product state and filters
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [fragile, setFragile] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("asc");

  // Modal state for adding and editing products
  const [showModal, setShowModal] = useState(false);
  const [modalProduct, setModalProduct] = useState({
    name: "",
    category: "",
    fragile: false,
    quantity: 1,
    cost: 0,
  });
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line
  }, [page, search, category, fragile, sortField, sortOrder]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/");
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/products", {
        params: {
          page,
          limit: 5,
          search,
          category,
          fragile,
          sort: sortField,
          order: sortOrder,
        },
      });
      setProducts(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      alert("Failed to fetch products");
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleAddProduct = () => {
    setModalProduct({
      name: "",
      category: "",
      fragile: false,
      quantity: 1,
      cost: 0,
    });
    setIsEdit(false);
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setModalProduct({ ...product });
    setIsEdit(true);
    setShowModal(true);
  };

  const handleModalSave = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await axios.put(`http://localhost:8080/api/products/${modalProduct._id}`, modalProduct);
      } else {
        await axios.post("http://localhost:8080/api/products", modalProduct);
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || "Error saving product");
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await axios.delete(`http://localhost:8080/api/products/${id}`);
      fetchProducts();
    } catch {
      alert("Failed to delete product");
    }
  };

  const handleModalClose = () => setShowModal(false);

  // Pagination arrow handling
  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };
  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="bg-red-600 text-white w-full fixed top-0 left-0 right-0 z-10">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 font-bold text-xl">MyApp</div>
            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-4">
              <a href="#" className="hover:bg-red-700 px-3 py-2 rounded">
                Home
              </a>
              <a href="#" className="hover:bg-red-700 px-3 py-2 rounded">
                About
              </a>
              <a href="#" className="hover:bg-red-700 px-3 py-2 rounded">
                Contact
              </a>
              <button
                onClick={handleLogout}
                className="bg-blue-500 hover:bg-blue-600 px-3 py-2 rounded"
              >
                Logout
              </button>
            </div>
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                type="button"
                className="focus:outline-none"
              >
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden px-2 pt-2 pb-3 space-y-1">
            <a href="#" className="block px-3 py-2 rounded hover:bg-red-700">
              Home
            </a>
            <a href="#" className="block px-3 py-2 rounded hover:bg-red-700">
              About
            </a>
            <a href="#" className="block px-3 py-2 rounded hover:bg-red-700">
              Contact
            </a>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-3 py-2 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        )}
      </nav>

      {/* Main Content */}
      {/* Add bg-gray-50 (or white) here to ensure visible background for blur effect */}
      <div className="pt-20 px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-screen">
        <h1 className="text-black text-2xl font-semibold text-center mb-6">
          Product Tracking Dashboard
        </h1>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row justify-between mb-4 gap-3">
          <button
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            onClick={handleAddProduct}
          >
            ➕ Add Product
          </button>
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              placeholder="Search product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border px-3 py-2 rounded"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border px-3 py-2 rounded"
            >
              <option value="">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Clothing">Clothing</option>
              <option value="Furniture">Furniture</option>
            </select>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={fragile === "true"}
                onChange={(e) => setFragile(e.target.checked ? "true" : "")}
                className="mr-2"
              />
              Fragile
            </label>
          </div>
        </div>

        {/* Table of products */}
        <div className="overflow-x-auto bg-white shadow-md rounded mt-4">
          <table className="min-w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-center align-middle font-bold border-b">S.No.</th>
                <th className="p-2 text-center align-middle font-bold border-b">Name</th>
                <th className="p-2 text-center align-middle font-bold border-b">Category</th>
                <th className="p-2 text-center align-middle font-bold border-b">Fragile</th>
                <th className="p-2 text-center align-middle font-bold border-b">Quantity</th>
                <th className="p-2 text-center align-middle font-bold border-b">Cost</th>
                <th className="p-2 text-center align-middle font-bold border-b">Total Cost</th>
                <th className="p-2 text-center align-middle font-bold border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map((p, i) => (
                  <tr key={p._id} className="border-t">
                    <td className="p-2 text-center align-middle">{(page - 1) * 5 + i + 1}</td>
                    <td className="p-2 text-center align-middle">{p.name}</td>
                    <td className="p-2 text-center align-middle">{p.category}</td>
                    <td className="p-2 text-center align-middle">
                      {p.fragile ? (
                        <span className="inline-block text-lg">&#x2705;</span>
                      ) : (
                        <span className="inline-block text-lg">&#x274C;</span>
                      )}
                    </td>
                    <td className="p-2 text-center align-middle">{p.quantity}</td>
                    <td className="p-2 text-center align-middle">{p.cost}</td>
                    <td className="p-2 text-center align-middle">{p.quantity * p.cost}</td>
                    <td className="p-2 text-center align-middle">
                      <div className="flex justify-center gap-2">
                        <button
                          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-1 px-3 rounded flex items-center gap-1"
                          onClick={() => handleEditProduct(p)}
                        >
                          <span role="img" aria-label="edit">✏️</span> Edit
                        </button>
                        <button
                          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-1 px-3 rounded flex items-center gap-1"
                          onClick={() => handleDeleteProduct(p._id)}
                        >
                          <span role="img" aria-label="delete">🗑️</span> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center p-4">No products found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-4 gap-2">
          <button
            onClick={handlePrevPage}
            disabled={page === 1}
            className={`px-3 py-1 rounded ${
              page === 1 ? "bg-gray-300 text-gray-400 cursor-not-allowed" : "bg-blue-500 text-white"
            }`}
          >
            &#8592;
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 rounded font-bold border ${
                page === i + 1 ? "bg-blue-700 text-white border-2 border-blue-900" : "bg-blue-500 text-white"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={handleNextPage}
            disabled={page === totalPages}
            className={`px-3 py-1 rounded ${
              page === totalPages ? "bg-gray-300 text-gray-400 cursor-not-allowed" : "bg-blue-500 text-white"
            }`}
          >
            &#8594;
          </button>
        </div>
      </div>

      {/* Modal for Add/Edit Product */}
      {showModal && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50 bg-white/30 backdrop-blur-md">
          <form
            onSubmit={handleModalSave}
            className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-lg transition-all"
            autoComplete="off"
          >
            <h2 className="text-2xl font-extrabold text-gray-800 mb-6">{isEdit ? "Edit" : "Add"} Product</h2>
            <div className="mb-5">
              <label className="block mb-2 text-gray-700 font-semibold">Name</label>
              <input
                type="text"
                className="border border-gray-300 w-full px-4 py-2 rounded-xl focus:outline-none focus:border-blue-400 text-lg transition-all"
                value={modalProduct.name}
                onChange={e => setModalProduct({...modalProduct, name: e.target.value})}
                required
              />
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-gray-700 font-semibold">Category</label>
              <select
                className="border border-gray-300 w-full px-4 py-2 rounded-xl focus:outline-none focus:border-blue-400 text-lg transition-all"
                value={modalProduct.category}
                onChange={e => setModalProduct({...modalProduct, category: e.target.value})}
                required
              >
                <option value="">Select category</option>
                <option value="Electronics">Electronics</option>
                <option value="Clothing">Clothing</option>
                <option value="Furniture">Furniture</option>
              </select>
            </div>
            <div className="mb-5 flex items-center space-x-2">
              <input
                type="checkbox"
                checked={modalProduct.fragile}
                onChange={e => setModalProduct({...modalProduct, fragile: e.target.checked})}
                id="fragile"
                className="form-checkbox h-5 w-5 text-blue-600 accent-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="fragile" className="text-gray-700 font-semibold">Fragile</label>
            </div>
            <div className="mb-5">
              <label className="block mb-2 text-gray-700 font-semibold">Quantity</label>
              <input
                type="number"
                className="border border-gray-300 w-full px-4 py-2 rounded-xl focus:outline-none focus:border-blue-400 text-lg transition-all"
                value={modalProduct.quantity}
                min="1"
                onChange={e => setModalProduct({...modalProduct, quantity: e.target.value})}
                required
              />
            </div>
            <div className="mb-8">
              <label className="block mb-2 text-gray-700 font-semibold">Cost per item</label>
              <input
                type="number"
                className="border border-gray-300 w-full px-4 py-2 rounded-xl focus:outline-none focus:border-blue-400 text-lg transition-all"
                value={modalProduct.cost}
                min="0"
                onChange={e => setModalProduct({...modalProduct, cost: e.target.value})}
                required
              />
            </div>
            <div className="flex justify-end gap-4">
              <button
                type="button"
                className="px-6 py-2 rounded-xl bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 active:bg-gray-400 transition-all"
                onClick={handleModalClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-7 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold shadow-sm transition-all"
              >
                {isEdit ? "Update" : "Add"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
