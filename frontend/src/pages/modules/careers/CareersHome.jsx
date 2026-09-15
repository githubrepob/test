import { useNavigate } from "react-router-dom";

const CareersHome = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-10">

      {/* HERO SECTION */}
      <div className="bg-zinc-900 p-10 rounded-2xl border border-zinc-800">

        <h1 className="text-3xl font-bold mb-4">
          Accelerate Your Placement Journey 🚀
        </h1>

        <p className="text-gray-400 max-w-2xl mb-6">
          Discover internships, micro-internships, referral opportunities,
          and campus-exclusive hiring programs. Built for students,
          powered by seniors, verified by your community.
        </p>

        <div className="flex gap-4">
          <button
            onClick={() => navigate("internships")}
            className="bg-purple-600 px-5 py-3 rounded-lg text-sm"
          >
            Explore Internships
          </button>

          <button
            onClick={() => navigate("referrals")}
            className="bg-zinc-800 px-5 py-3 rounded-lg text-sm"
          >
            Find Referral
          </button>
        </div>
      </div>

      {/* STATS SECTION */}
      <div className="grid md:grid-cols-3 gap-6">

        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
          <h3 className="text-2xl font-bold">128+</h3>
          <p className="text-gray-400 text-sm">
            Active Opportunities
          </p>
        </div>

        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
          <h3 className="text-2xl font-bold">54</h3>
          <p className="text-gray-400 text-sm">
            Seniors Open to Refer
          </p>
        </div>

        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
          <h3 className="text-2xl font-bold">23</h3>
          <p className="text-gray-400 text-sm">
            PPO Offers This Semester
          </p>
        </div>

      </div>

      {/* TRENDING DOMAINS */}
      <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
        <h2 className="font-semibold mb-4">
          🔥 Trending Domains
        </h2>

        <div className="flex flex-wrap gap-3">
          {["AI/ML", "Backend", "Web3", "Cloud", "Cybersecurity"].map(domain => (
            <span
              key={domain}
              className="bg-zinc-800 px-3 py-1 rounded-full text-sm"
            >
              {domain}
            </span>
          ))}
        </div>
      </div>

    </div>
  );
};

export default CareersHome;