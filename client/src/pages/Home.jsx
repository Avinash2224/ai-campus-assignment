import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import axios from "axios";

export default function Home() {
  // Navbar state for mobile
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

  // Modal state
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
    // Check if user is authenticated
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    
    fetchProducts();
    // eslint-disable-next-line
  }, [page, search, category, fragile, sortField, sortOrder]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }
      
      const res = await axios.get("http://localhost:8080/api/products", {
        headers: {
          Authorization: `Bearer ${token}`
        },
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
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
      } else {
        alert("Failed to fetch products");
      }
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

  const handleAdd = () => {
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

  const handleEdit = (product) => {
    setModalProduct(product);
    setIsEdit(true);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }
      
      const headers = {
        Authorization: `Bearer ${token}`
      };
      
      if (isEdit) {
        await axios.put(`http://localhost:8080/api/products/${modalProduct._id}`, modalProduct, { headers });
      } else {
        await axios.post("http://localhost:8080/api/products", modalProduct, { headers });
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
      } else {
        alert("Error saving product");
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }
      
      await axios.delete(`http://localhost:8080/api/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      fetchProducts();
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
      } else {
        alert("Failed to delete product");
      }
    }
  };

  const handleModalClose = () => setShowModal(false);

  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages) setPage(page + 1);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Navbar */}
      <nav className="bg-red-600 text-white fixed top-0 left-0 right-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="font-bold text-xl">MyApp</div>
            {/* Desktop nav */}
            <div className="hidden md:flex items-center space-x-4">
              <a href="#" className="hover:bg-red-700 px-3 py-2 rounded">Home</a>
              <a
                href="#"
                onClick={() => navigate("/track")}
                className="hover:bg-red-700 px-3 py-2 rounded cursor-pointer"
              >
                Track
              </a>
              <a href="#" className="hover:bg-red-700 px-3 py-2 rounded">Contact</a>
              <button
                onClick={handleLogout}
                className="bg-black hover:bg-gray-900 text-white px-3 py-2 rounded"
              >
                Logout
              </button>
            </div>
            {/* Mobile nav button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                type="button"
                className="focus:outline-none"
              >
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  xmlns="http://www.w3.org/2000/svg">
                  {isOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
          {/* Mobile nav menu */}
          {isOpen && (
            <div className="md:hidden px-2 pt-2 pb-3 space-y-1">
              <a href="#" className="block px-3 py-2 rounded hover:bg-red-700">Home</a>
              <a
                href="#"
                onClick={() => { navigate("/track"); setIsOpen(false); }}
                className="block px-3 py-2 rounded hover:bg-red-700 cursor-pointer"
              >
                Track
              </a>
              <a href="#" className="block px-3 py-2 rounded hover:bg-red-700">Contact</a>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20 px-4 sm:px-6 lg:px-8">
        <h1 className="text-center text-3xl font-bold mb-6 text-gray-900">
          Product Dashboard
        </h1>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
          <button
            onClick={handleAdd}
            className="bg-black hover:bg-gray-900 text-white px-4 py-2 rounded"
          >
            + Add Product
          </button>

          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              placeholder="Search"
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
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={fragile === "true"}
                onChange={(e) => setFragile(e.target.checked ? "true" : "")}
                className="mr-2 cursor-pointer"
              />
              <span>Fragile</span>
            </label>
          </div>
        </div>

        {/* Product table */}
        <div className="overflow-auto bg-white rounded shadow-lg">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-4 py-2">S. No.</th>
                <th className="border border-gray-300 px-4 py-2 cursor-pointer" onClick={() => handleSort("name")}>Name</th>
                <th className="border border-gray-300 px-4 py-2 cursor-pointer" onClick={() => handleSort("category")}>Category</th>
                <th className="border border-gray-300 px-4 py-2">Fragile</th>
                <th className="border border-gray-300 px-4 py-2 cursor-pointer" onClick={() => handleSort("quantity")}>Quantity</th>
                <th className="border border-gray-300 px-4 py-2 cursor-pointer" onClick={() => handleSort("cost")}>Cost</th>
                <th className="border border-gray-300 px-4 py-2 cursor-pointer" onClick={() => handleSort("totalcost")}>Total Cost</th>
                <th className="border border-gray-300 px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length ? (
                products.map((product, i) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 text-center">{(page - 1) * 5 + i + 1}</td>
                    <td className="border border-gray-300 px-4 py-2">{product.name}</td>
                    <td className="border border-gray-300 px-4 py-2">{product.category}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{product.fragile ? "✅" : "❌"}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{product.quantity}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{product.cost}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{product.quantity * product.cost}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="mr-2 bg-black hover:bg-gray-900 text-white px-3 py-1 rounded"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="bg-black hover:bg-gray-900 text-white px-3 py-1 rounded"
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-4">No Products Found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-4 space-x-2">
          <button
            onClick={handlePrev}
            disabled={page === 1}
            className={`px-3 py-1 rounded ${page === 1 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-black text-white hover:bg-gray-900"}`}
          >
            &larr;
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-4 py-1 rounded font-bold border ${page === i + 1 ? "bg-black text-white border-black" : "border-gray-300 text-black"}`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={handleNext}
            disabled={page === totalPages}
            className={`px-3 py-1 rounded ${page === totalPages ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-black text-white hover:bg-gray-900"}`}
          >
            &rarr;
          </button>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/30 backdrop-blur-md z-50">
          <form
            onSubmit={handleSave}
            className="bg-white rounded-3xl shadow-2xl p-10 max-w-lg w-full"
            autoComplete="off"
          >
            <h2 className="text-2xl font-extrabold mb-6 text-gray-900">
              {isEdit ? "Edit" : "Add"} Product
            </h2>

            <div className="mb-5">
              <label className="block text-gray-700 font-semibold mb-2" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                type="text"
                className="w-full border px-4 py-2 rounded-xl focus:ring-2 focus:ring-black focus:outline-none"
                value={modalProduct.name}
                onChange={(e) => setModalProduct({ ...modalProduct, name: e.target.value })}
                required
              />
            </div>

            <div className="mb-5">
              <label className="block text-gray-700 font-semibold mb-2" htmlFor="category">
                Category
              </label>
              <select
                id="category"
                className="w-full border px-4 py-2 rounded-xl focus:ring-2 focus:ring-black focus:outline-none"
                value={modalProduct.category}
                onChange={(e) => setModalProduct({ ...modalProduct, category: e.target.value })}
                required
              >
                <option value="">Select category</option>
                <option value="Electronics">Electronics</option>
                <option value="Clothing">Clothing</option>
                <option value="Furniture">Furniture</option>
              </select>
            </div>

            <div className="mb-5 flex items-center space-x-3">
              <input
                id="fragile"
                type="checkbox"
                className="cursor-pointer accent-black"
                checked={modalProduct.fragile}
                onChange={(e) => setModalProduct({ ...modalProduct, fragile: e.target.checked })}
              />
              <label htmlFor="fragile" className="font-semibold cursor-pointer">
                Fragile
              </label>
            </div>

            <div className="mb-5">
              <label className="block text-gray-700 font-semibold mb-2" htmlFor="quantity">
                Quantity
              </label>
              <input
                id="quantity"
                type="number"
                min="1"
                className="w-full border px-4 py-2 rounded-xl focus:ring-2 focus:ring-black focus:outline-none"
                value={modalProduct.quantity}
                onChange={(e) => setModalProduct({ ...modalProduct, quantity: Number(e.target.value) })}
                required
              />
            </div>

            <div className="mb-8">
              <label className="block text-gray-700 font-semibold mb-2" htmlFor="cost">
                Cost per item
              </label>
              <input
                id="cost"
                type="number"
                min="0"
                className="w-full border px-4 py-2 rounded-xl focus:ring-2 focus:ring-black focus:outline-none"
                value={modalProduct.cost}
                onChange={(e) => setModalProduct({ ...modalProduct, cost: Number(e.target.value) })}
                required
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleModalClose}
                className="px-6 py-2 rounded-xl bg-gray-300 hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-2 rounded-xl bg-black text-white hover:bg-gray-900 transition"
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
 