import { useState } from "react";

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-red-600 text-white w-full fixed top-0 left-0 right-0">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 font-bold text-xl">MyApp</div>
          <div className="hidden md:flex space-x-4">
            <a href="#" className="hover:bg-red-700 px-3 py-2 rounded">Home</a>
            <a href="#" className="hover:bg-red-700 px-3 py-2 rounded">About</a>
            <a href="#" className="hover:bg-red-700 px-3 py-2 rounded">Contact</a>
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
          <a href="#" className="block px-3 py-2 rounded hover:bg-red-700">Home</a>
          <a href="#" className="block px-3 py-2 rounded hover:bg-red-700">About</a>
          <a href="#" className="block px-3 py-2 rounded hover:bg-red-700">Contact</a>
        </div>
      )}
    </nav>
  );
}
