import { NavLink, Outlet, useNavigate } from "react-router-dom";
import ModuleLayout from "../../../components/ModuleLayout";
import { getToken } from "../../../utils/auth";
import { Briefcase, FileText, MessageCircle, Users, Plus } from "lucide-react";

const CareersLayout = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!getToken();

  const tabs = [
    { name: "Explore", path: "internships", icon: Briefcase },
    { name: "Referrals", path: "referrals", icon: Users },
  ];

  const authTabs = [
    { name: "My Applications", path: "my-applications", icon: FileText },
    { name: "Messages", path: "chat", icon: MessageCircle },
  ];

  return (
    <ModuleLayout title="CAREERS" subtitle="Internships, opportunities, referrals — your gateway to the industry.">
      <div className="flex items-center justify-between border-b border-zinc-800 mb-6">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-5 py-3 text-sm font-medium border-b-2 transition ${
                  isActive
                    ? "text-purple-400 border-purple-500"
                    : "text-zinc-500 border-transparent hover:text-zinc-300"
                }`
              }
            >
              <tab.icon size={14} />
              {tab.name}
            </NavLink>
          ))}
          {isLoggedIn && authTabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-5 py-3 text-sm font-medium border-b-2 transition ${
                  isActive
                    ? "text-purple-400 border-purple-500"
                    : "text-zinc-500 border-transparent hover:text-zinc-300"
                }`
              }
            >
              <tab.icon size={14} />
              {tab.name}
            </NavLink>
          ))}
        </div>

        {isLoggedIn && (
          <button
            onClick={() => navigate("/careers/post")}
            className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-lg shadow-purple-500/20 mb-1"
          >
            <Plus size={14} /> Post
          </button>
        )}
      </div>

      <Outlet />
    </ModuleLayout>
  );
};

export default CareersLayout;