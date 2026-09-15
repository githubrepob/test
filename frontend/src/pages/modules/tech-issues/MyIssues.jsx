import { useEffect, useState } from "react";
import TechIssuesLayout from "../../../components/ModuleLayout";
import api from "../../../api/axios";
import { Link } from "react-router-dom";

const MyIssues = () => {
  const [openIssues, setOpenIssues] = useState([]);
  const [closedIssues, setClosedIssues] = useState([]);

  useEffect(() => {
    const fetchIssues = async () => {
      const open = await api.get("/tech-issues?mine=true&status=open");
      const closed = await api.get("/tech-issues?mine=true&status=closed");

      setOpenIssues(open.data.data);
      setClosedIssues(closed.data.data);
    };

    fetchIssues();
  }, []);

  return (
    <TechIssuesLayout>
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-6">My Tech Issues</h1>

        {/* OPEN */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Open Issues</h2>
          {openIssues.map((issue) => (
            <Link
              key={issue._id}
              to={`/tech-issues/${issue._id}`}
              className="block bg-zinc-900 border border-zinc-800 p-4 rounded mb-3"
            >
              {issue.title}
            </Link>
          ))}
        </section>

        {/* CLOSED */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Closed Issues</h2>
          {closedIssues.map((issue) => (
            <Link
              key={issue._id}
              to={`/tech-issues/${issue._id}`}
              className="block bg-zinc-900 border border-zinc-800 p-4 rounded mb-3 opacity-70"
            >
              {issue.title}
            </Link>
          ))}
        </section>
      </div>
    </TechIssuesLayout>
  );
};

export default MyIssues;
