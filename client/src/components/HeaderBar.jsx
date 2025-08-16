// src/components/HeaderBar.jsx
import LogoutButton from "./LogoutButton";

export default function HeaderBar({ onLogout }) {
  return (
    <div className="bg-white rounded-b-xl flex items-center justify-between px-8 py-6 mb-8 border-b border-gray-100">
      <div className="flex items-center gap-3">
        <span className="bg-blue-50 text-blue-600 p-2 rounded-xl">
          {/* Cube icon (outline) */}
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
            <rect x="5" y="7" width="14" height="10" rx="2" stroke="#2563eb" strokeWidth="2"/>
            <path stroke="#2563eb" strokeWidth="2" d="M8 17v2a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2"/>
          </svg>
        </span>
        <div>
          <div className="text-2xl font-bold text-gray-900">Product Management</div>
          <div className="text-gray-500 text-sm">Manage your product inventory</div>
        </div>
      </div>
      <LogoutButton onLogout={onLogout} />
    </div>
  );
}
