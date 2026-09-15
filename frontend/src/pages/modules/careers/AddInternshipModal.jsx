// pages/modules/careers/AddInternshipModal.jsx

import { useState } from "react";

const AddInternshipModal = ({ onClose, onAdd }) => {

  const [form, setForm] = useState({
    company: "",
    role: "",
    domain: "",
    stipend: "",
    duration: "",
    location: "",
    ppo: false
  });

  const handleSubmit = () => {

    const newInternship = {
      ...form,
      id: Date.now(),
      applicants: 0
    };

    onAdd(newInternship);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">

      <div className="bg-zinc-900 p-6 rounded-xl w-[500px] border border-zinc-800">

        <h2 className="text-lg font-semibold mb-4">
          Post Internship
        </h2>

        {Object.keys(form).map((key) =>
          key !== "ppo" ? (
            <input
              key={key}
              placeholder={key}
              className="w-full bg-zinc-800 p-2 rounded mb-3 text-sm outline-none"
              onChange={(e) =>
                setForm({ ...form, [key]: e.target.value })
              }
            />
          ) : (
            <label key={key} className="flex items-center gap-2 mb-3 text-sm">
              <input
                type="checkbox"
                onChange={(e) =>
                  setForm({ ...form, ppo: e.target.checked })
                }
              />
              PPO Offered
            </label>
          )
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="text-sm text-gray-400"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="bg-purple-600 px-4 py-2 rounded text-sm"
          >
            Post
          </button>
        </div>

      </div>
    </div>
  );
};

export default AddInternshipModal;