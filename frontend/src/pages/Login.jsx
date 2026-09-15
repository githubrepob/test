import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { loginUser } from "../api/authApi";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const data = await loginUser({
        collegeEmail: email,
        password,
      });

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

      console.log("LOGIN SUCCESS:", data);

      setLoading(false);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <AuthLayout>
      <h1 className="text-3xl font-semibold mb-2">Welcome back</h1>
      <p className="text-gray-400 mb-8">
        Sign in to continue to Campus Connect
      </p>

      <form onSubmit={handleLogin} className="space-y-5">
        <input
          type="email"
          placeholder="College Email"
          className="auth-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="auth-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="text-right">
          <span
            onClick={() => (window.location.href = "/forgot-password")}
            className="text-sm text-gray-400 cursor-pointer hover:text-white transition"
          >
            Forgot password?
          </span>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg
            bg-white text-black font-medium
            hover:bg-gray-200 transition
            disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <p className="text-center text-sm text-gray-400">
          New to Campus Connect?{" "}
          <button type="button" onClick={() => navigate("/register")} className="text-white hover:underline">
            Create an account
          </button>
        </p>
      </form>
    </AuthLayout>
  );
}
