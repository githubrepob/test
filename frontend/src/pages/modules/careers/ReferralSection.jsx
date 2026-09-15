import { useState } from "react";

const ReferralSection = ({
  requests,
  setRequests,
  seniors,
  setSeniors
}) => {

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showSeniorModal, setShowSeniorModal] = useState(false);

  const [newRequest, setNewRequest] = useState({
    name: "",
    targetCompany: "",
    domain: "",
    skills: ""
  });

  const [newSenior, setNewSenior] = useState({
    name: "",
    company: "",
    openFor: ""
  });

  const [requestedSeniors, setRequestedSeniors] = useState([]);

  // Add Referral Request
  const handleAddRequest = () => {
    const newEntry = {
      id: Date.now(),
      ...newRequest,
      skills: newRequest.skills.split(",").map(s => s.trim()),
      status: "Open"
    };

    setRequests(prev => [newEntry, ...prev]);
    setShowRequestModal(false);
    setNewRequest({ name: "", targetCompany: "", domain: "", skills: "" });
  };

  // Add Senior
  const handleAddSenior = () => {
    const newEntry = {
      id: Date.now(),
      ...newSenior,
      openFor: newSenior.openFor.split(",").map(s => s.trim()),
      referralScore: Math.floor(Math.random() * 100)
    };

    setSeniors(prev => [newEntry, ...prev]);
    setShowSeniorModal(false);
    setNewSenior({ name: "", company: "", openFor: "" });
  };

  const handleConnectStudent = (id) => {
    setRequests(prev =>
      prev.map(r =>
        r.id === id ? { ...r, status: "Connected" } : r
      )
    );
  };

  const handleRequestSenior = (id) => {
    if (!requestedSeniors.includes(id)) {
      setRequestedSeniors(prev => [...prev, id]);
    }
  };

  return (
    <div className="space-y-8">

      {/* ACTION BAR */}
      <div className="flex gap-4">
        <button
          onClick={() => setShowRequestModal(true)}
          className="bg-purple-600 px-4 py-2 rounded-lg text-sm"
        >
          + Need Referral
        </button>

        <button
          onClick={() => setShowSeniorModal(true)}
          className="bg-zinc-800 px-4 py-2 rounded-lg text-sm border border-zinc-700"
        >
          + Open To Refer
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-10">

        {/* STUDENTS */}
        <div>
          <h2 className="text-xl font-semibold mb-6">
            Students Needing Referral
          </h2>

          {requests.map(req => (
            <div
              key={req.id}
              className="bg-zinc-900 p-5 rounded-xl border border-zinc-800 mb-5 hover:border-purple-500 transition"
            >
              <h4 className="font-semibold text-lg">{req.name}</h4>

              <p className="text-sm text-gray-400">
                Target: {req.targetCompany}
              </p>

              <p className="text-xs text-gray-500 mt-1">
                Domain: {req.domain}
              </p>

              <div className="flex flex-wrap gap-2 mt-3">
                {req.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="bg-zinc-800 text-xs px-2 py-1 rounded"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <div className="flex justify-between items-center mt-4">
                <span className={`text-xs px-2 py-1 rounded ${
                  req.status === "Connected"
                    ? "bg-green-600"
                    : "bg-yellow-600"
                }`}>
                  {req.status}
                </span>

                <button
                  onClick={() => handleConnectStudent(req.id)}
                  className="bg-purple-600 px-3 py-1 rounded text-sm"
                >
                  Connect
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* SENIORS */}
        <div>
          <h2 className="text-xl font-semibold mb-6">
            Seniors Open To Refer
          </h2>

          {seniors.map(senior => (
            <div
              key={senior.id}
              className="bg-zinc-900 p-5 rounded-xl border border-zinc-800 mb-5 hover:border-purple-500 transition"
            >
              <h4 className="font-semibold text-lg">{senior.name}</h4>

              <p className="text-sm text-gray-400">
                Company: {senior.company}
              </p>

              <p className="text-xs text-gray-500 mt-1">
                Referral Score: {senior.referralScore}
              </p>

              <div className="flex flex-wrap gap-2 mt-3">
                {senior.openFor.map((role, i) => (
                  <span
                    key={i}
                    className="bg-zinc-800 text-xs px-2 py-1 rounded"
                  >
                    {role}
                  </span>
                ))}
              </div>

              <button
                onClick={() => handleRequestSenior(senior.id)}
                className={`mt-4 px-3 py-1 rounded text-sm ${
                  requestedSeniors.includes(senior.id)
                    ? "bg-green-600"
                    : "bg-purple-600"
                }`}
              >
                {requestedSeniors.includes(senior.id)
                  ? "Requested"
                  : "Request Referral"}
              </button>
            </div>
          ))}
        </div>

      </div>

      {/* REQUEST MODAL */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
          <div className="bg-zinc-900 p-6 rounded-xl w-[400px] border border-zinc-800 space-y-3">
            <h3 className="font-semibold">Post Referral Request</h3>

            <input
              placeholder="Your Name"
              className="w-full bg-zinc-800 p-2 rounded text-sm"
              onChange={(e) =>
                setNewRequest({ ...newRequest, name: e.target.value })
              }
            />

            <input
              placeholder="Target Company"
              className="w-full bg-zinc-800 p-2 rounded text-sm"
              onChange={(e) =>
                setNewRequest({ ...newRequest, targetCompany: e.target.value })
              }
            />

            <input
              placeholder="Domain"
              className="w-full bg-zinc-800 p-2 rounded text-sm"
              onChange={(e) =>
                setNewRequest({ ...newRequest, domain: e.target.value })
              }
            />

            <input
              placeholder="Skills (comma separated)"
              className="w-full bg-zinc-800 p-2 rounded text-sm"
              onChange={(e) =>
                setNewRequest({ ...newRequest, skills: e.target.value })
              }
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-gray-400 text-sm"
              >
                Cancel
              </button>

              <button
                onClick={handleAddRequest}
                className="bg-purple-600 px-4 py-2 rounded text-sm"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SENIOR MODAL */}
      {showSeniorModal && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
          <div className="bg-zinc-900 p-6 rounded-xl w-[400px] border border-zinc-800 space-y-3">
            <h3 className="font-semibold">Open To Refer</h3>

            <input
              placeholder="Your Name"
              className="w-full bg-zinc-800 p-2 rounded text-sm"
              onChange={(e) =>
                setNewSenior({ ...newSenior, name: e.target.value })
              }
            />

            <input
              placeholder="Company"
              className="w-full bg-zinc-800 p-2 rounded text-sm"
              onChange={(e) =>
                setNewSenior({ ...newSenior, company: e.target.value })
              }
            />

            <input
              placeholder="Open For (comma separated roles)"
              className="w-full bg-zinc-800 p-2 rounded text-sm"
              onChange={(e) =>
                setNewSenior({ ...newSenior, openFor: e.target.value })
              }
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowSeniorModal(false)}
                className="text-gray-400 text-sm"
              >
                Cancel
              </button>

              <button
                onClick={handleAddSenior}
                className="bg-purple-600 px-4 py-2 rounded text-sm"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ReferralSection;