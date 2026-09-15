import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import CustomSelect from "../components/CustomSelect";
import { registerUser } from "../api/authApi";

const DEPARTMENTS = ["ENGINEERING", "BPHARMA", "MCA", "MBA"];

const BRANCHES = [
  "CSE",
  "CSE-AIML",
  "CSE-AI",
  "CS-IT",
  "IT",
  "ECE",
  "EN",
  "CSE-AIDS",
];

const INITIAL_OPTIONS = [
  "React",
  "Node.js",
  "MongoDB",
  "Python",
  "Java",
  "C++",
  "UI/UX",
  "Machine Learning",
  "Data Science",
  "Cyber Security",
];

export default function Register() {
  const navigate = useNavigate();
  /* basic fields */
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  /* dropdown fields */
  const [department, setDepartment] = useState("");
  const [branch, setBranch] = useState("");
  const [semester, setSemester] = useState("");

  /* skills & domains */
  const [skills, setSkills] = useState([]);
  const [domains, setDomains] = useState([]);

  const [skillOptions, setSkillOptions] = useState(INITIAL_OPTIONS);
  const [domainOptions, setDomainOptions] = useState(INITIAL_OPTIONS);

  const [customSkill, setCustomSkill] = useState("");
  const [customDomain, setCustomDomain] = useState("");

  /* ui state */
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* helpers */
  const toggleItem = (item, list, setList) => {
    setList(
      list.includes(item) ? list.filter((i) => i !== item) : [...list, item]
    );
  };

  const addCustomSkill = () => {
    if (customSkill && !skillOptions.includes(customSkill)) {
      setSkillOptions([...skillOptions, customSkill]);
      setSkills([...skills, customSkill]);
      setCustomSkill("");
    }
  };

  const addCustomDomain = () => {
    if (customDomain && !domainOptions.includes(customDomain)) {
      setDomainOptions([...domainOptions, customDomain]);
      setDomains([...domains, customDomain]);
      setCustomDomain("");
    }
  };

  /* submit */
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password) {
      setError("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name,
        collegeEmail: email,
        password,
        department,
        branch,
        semester,
        skills,
        preferredTechDomain: domains,
      };

      const data = await registerUser(payload);

      // store auth data
      localStorage.setItem("campusconnect_token", data.token);
      localStorage.setItem(
        "campusconnect_user",
        JSON.stringify({
          _id: data._id,
          name: data.name,
          collegeEmail: data.collegeEmail,
          role: data.role,
        })
      );

      console.log("REGISTER + LOGIN SUCCESS:", data);

      setLoading(false);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <AuthLayout>
      <h1 className="text-3xl font-semibold mb-2">Create account</h1>
      <p className="text-gray-400 mb-6">
        Join Campus Connect and explore opportunities
      </p>

      <form
        onSubmit={handleRegister}
        className="space-y-5 max-h-[360px] overflow-y-auto pr-2"
      >
        <input
          className="auth-input"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="auth-input"
          placeholder="College Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="auth-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <CustomSelect
          label="Department"
          options={DEPARTMENTS}
          value={department}
          onChange={setDepartment}
        />

        <CustomSelect
          label="Branch"
          options={BRANCHES}
          value={branch}
          onChange={setBranch}
        />

        <CustomSelect
          label="Semester"
          options={[1, 2, 3, 4, 5, 6, 7, 8].map((s) => `Semester ${s}`)}
          value={semester}
          onChange={setSemester}
        />

        {/* Skills */}
        <div>
          <p className="text-sm text-gray-400 mb-2">Skills</p>
          <div className="flex flex-wrap gap-2">
            {skillOptions.map((skill) => (
              <button
                type="button"
                key={skill}
                onClick={() => toggleItem(skill, skills, setSkills)}
                className={`px-3 py-1 rounded-full text-sm border transition
                  ${
                    skills.includes(skill)
                      ? "bg-white text-black"
                      : "border-white/20 text-gray-300 hover:bg-white/10"
                  }`}
              >
                {skill}
              </button>
            ))}
          </div>

          <div className="flex gap-2 mt-3">
            <input
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
              placeholder="Add custom skill"
              className="auth-input flex-1"
            />
            <button
              type="button"
              onClick={addCustomSkill}
              className="px-4 rounded-lg bg-white text-black font-medium"
            >
              Add
            </button>
          </div>
        </div>

        {/* Preferred Tech Domain */}
        <div>
          <p className="text-sm text-gray-400 mb-2">Preferred Tech Domain</p>
          <div className="flex flex-wrap gap-2">
            {domainOptions.map((domain) => (
              <button
                type="button"
                key={domain}
                onClick={() => toggleItem(domain, domains, setDomains)}
                className={`px-3 py-1 rounded-full text-sm border transition
                  ${
                    domains.includes(domain)
                      ? "bg-white text-black"
                      : "border-white/20 text-gray-300 hover:bg-white/10"
                  }`}
              >
                {domain}
              </button>
            ))}
          </div>

          <div className="flex gap-2 mt-3">
            <input
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              placeholder="Add custom domain"
              className="auth-input flex-1"
            />
            <button
              type="button"
              onClick={addCustomDomain}
              className="px-4 rounded-lg bg-white text-black font-medium"
            >
              Add
            </button>
          </div>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 mt-4 rounded-lg
            bg-white text-black font-medium
            hover:bg-gray-200 transition
            disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <p className="text-center text-sm text-gray-400 pb-2">
          Already have an account?{" "}
          <button type="button" onClick={() => navigate("/login")} className="text-white hover:underline">
            Sign in
          </button>
        </p>
      </form>
    </AuthLayout>
  );
}
