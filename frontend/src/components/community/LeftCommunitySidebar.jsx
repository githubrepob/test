export default function LeftCommunitySidebar() {
  return (
    <div className="space-y-4 text-sm">
      <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
        <p className="font-medium mb-2">My Profile</p>
        <p className="text-gray-400 text-xs">Bhavesh Chauhan</p>
        <p className="text-gray-500 text-xs">CSE • 3rd Year</p>
      </div>

      <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
        <p className="font-medium mb-3">My Communities</p>
        <ul className="space-y-2 text-gray-400">
          <li className="hover:text-blue-400 cursor-pointer">⚛ React Devs</li>
          <li className="hover:text-blue-400 cursor-pointer">💼 Internships</li>
          <li className="hover:text-blue-400 cursor-pointer">🏆 Hackathons</li>
        </ul>
      </div>
    </div>
  );
}
