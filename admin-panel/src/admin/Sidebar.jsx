import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const menu = [
    { name: "Dashboard", path: "/admin" },
    { name: "Recent Searches", path: "/admin/searches" },
    { name: "Bookings", path: "/admin/bookings" },
    { name: "Users", path: "/admin/users" },
    { name: "Content", path: "/admin/content" },
    { name: "Settings", path: "/admin/settings" },
  ];

  return (
    <div className="w-64 bg-white shadow-lg p-5">
      <h1 className="text-2xl font-bold text-blue-600 mb-8">
        Admin Panel
      </h1>

      <div className="space-y-3">
        {menu.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg transition ${isActive
                ? "bg-blue-500 text-white"
                : "hover:bg-gray-200"
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
