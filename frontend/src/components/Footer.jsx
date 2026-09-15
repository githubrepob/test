import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="relative mt-24">
      {/* glass background */}
      <div className="absolute inset-0 bg-black/55 backdrop-blur-xl" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-14 text-sm text-gray-400">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

          {/* Brand */}
          <div>
            <h3 className="text-white text-base mb-3 font-display">
              uniVerse
            </h3>
            <p className="leading-relaxed max-w-xs">
              A connected academic universe for learning, collaboration, and growth beyond classrooms.
            </p>
          </div>

          {/* Modules */}
          <div>
            <p className="uppercase tracking-widest text-xs mb-4 text-gray-500 font-display">
              Modules
            </p>
            <ul className="space-y-2">
              <li><Link to="/notes" className="hover:text-white">Notes</Link></li>
              <li><Link to="/hackathons" className="hover:text-white">Hackathons</Link></li>
              <li><Link to="/referrals" className="hover:text-white">Referrals</Link></li>
              <li><Link to="/micro-internships" className="hover:text-white">Micro-Internships</Link></li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <p className="uppercase tracking-widest text-xs mb-4 text-gray-500 font-display">
              Community
            </p>
            <ul className="space-y-2">
              <li><Link to="/events" className="hover:text-white">Events</Link></li>
              <li><Link to="/leaderboard" className="hover:text-white">Leaderboard</Link></li>
              <li><Link to="/careers" className="hover:text-white">Careers</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="uppercase tracking-widest text-xs mb-4 text-gray-500 font-display">
              Legal
            </p>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="hover:text-white">Privacy</Link></li>
              <li><Link to="/terms" className="hover:text-white">Terms</Link></li>
              <li><Link to="/security" className="hover:text-white">Security</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 text-xs text-gray-500">
          © 2026 uniVerse · Built for students · Designed for the future
        </div>
      </div>
    </footer>
  );
}
