// src/components/LogoutButton.jsx
export default function LogoutButton({ onLogout }) {
  return (
    <button
      onClick={onLogout}
      className="bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg px-7 py-3 flex items-center gap-2 shadow focus:outline-none transition"
    >
      {/* Logout icon (outline) */}
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
      </svg>
      Logout
    </button>
  );
}
