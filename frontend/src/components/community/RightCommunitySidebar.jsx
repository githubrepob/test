export default function RightCommunitySidebar() {
  return (
    <div className="space-y-4 text-sm">
      <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
        <p className="font-medium mb-3">Suggested Communities</p>
        <ul className="space-y-2 text-gray-400">
          <li className="hover:text-purple-400 cursor-pointer">🔥 Web3 Builders</li>
          <li className="hover:text-purple-400 cursor-pointer">🤖 AI & ML</li>
          <li className="hover:text-purple-400 cursor-pointer">📱 Mobile Dev</li>
        </ul>
      </div>

      <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
        <p className="font-medium mb-2">Active Now</p>
        <p className="text-gray-400 text-xs">23 students online</p>
      </div>
    </div>
  );
}
