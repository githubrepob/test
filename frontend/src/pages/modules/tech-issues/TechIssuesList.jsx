import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import TechIssuesLayout from "../../../components/ModuleLayout";
import IssueCard from "../../../components/tech-issues/IssueCard";
import api from "../../../api/axios";

dayjs.extend(relativeTime);

const FILTERS = [
  { key: "latest", label: "Latest" },
  { key: "open", label: "Open" },
  { key: "closed", label: "Closed" },
  { key: "mine", label: "My Issues" }
];

const TechIssuesList = () => {
  const [issues, setIssues] = useState([]);
  const [activeFilter, setActiveFilter] = useState("latest");

  const [search, setSearch] = useState("");
  const [tag, setTag] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchIssues();
    // eslint-disable-next-line
  }, [activeFilter]);

  const fetchIssues = async () => {
    try {
      setLoading(true);

      let url = "/tech-issues?";

      // status filters
      if (activeFilter === "open") url += "status=open&";
      if (activeFilter === "closed") url += "status=closed&";
      if (activeFilter === "mine") url += "mine=true&";

      // search + tag
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (tag) url += `tag=${encodeURIComponent(tag)}&`;

      const res = await api.get(url);
      setIssues(res.data.data);
    } catch (error) {
      console.error("Failed to fetch issues", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TechIssuesLayout>
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">
            Tech Issues
          </h1>

          <Link
            to="/tech-issues/create"
            className="bg-blue-500 text-white px-5 py-2 rounded font-semibold hover:bg-blue-600"
          >
            Ask Question
          </Link>
        </div>

        {/* SEARCH + TAG FILTER (STACK OVERFLOW STYLE) */}
        <div className="flex flex-wrap gap-4 mb-6">
          <input
            type="text"
            placeholder="Search questions…"
            className="bg-zinc-900 border border-zinc-800 p-2 rounded w-full md:w-1/2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchIssues()}
          />

          <input
            type="text"
            placeholder="Filter by tag"
            className="bg-zinc-900 border border-zinc-800 p-2 rounded w-full md:w-1/4"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchIssues()}
          />

          <button
            onClick={fetchIssues}
            className="bg-zinc-800 border border-zinc-700 px-4 py-2 rounded text-sm hover:bg-zinc-700"
          >
            Apply
          </button>
        </div>

        {/* FILTER TABS */}
        <div className="flex gap-3 mb-6">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-4 py-2 rounded text-sm ${
                activeFilter === f.key
                  ? "bg-zinc-700 text-white"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-400"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* LIST */}
        <div className="space-y-4">
          {loading && (
            <p className="text-zinc-400">Loading…</p>
          )}

          {!loading && issues.length === 0 && (
            <p className="text-zinc-400">
              No issues found.
            </p>
          )}

          {issues.map((issue) => (
            <IssueCard
              key={issue._id}
              issue={{
                ...issue,
                timeAgo: dayjs(issue.createdAt).fromNow()
              }}
            />
          ))}
        </div>
      </div>
    </TechIssuesLayout>
  );
};

export default TechIssuesList;
