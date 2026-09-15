import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import axios from "axios";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");

    if (!password) {
      setError("Please enter a new password");
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        `http://localhost:5000/api/auth/reset-password/${token}`,
        { password }
      );

      setMessage("Password reset successful");
      setLoading(false);

      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setLoading(false);
      setError(
        err.response?.data?.message || "Reset failed"
      );
    }
  };

  return (
    <AuthLayout>
      <h1 className="text-3xl font-semibold mb-2">
        Reset password
      </h1>
      <p className="text-gray-400 mb-8">
        Enter your new password
      </p>

      <form onSubmit={handleReset} className="space-y-5">
        <input
          type="password"
          placeholder="New Password"
          className="auth-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}
        {message && (
          <p className="text-green-400 text-sm">{message}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg
            bg-white text-black font-medium
            hover:bg-gray-200 transition
            disabled:opacity-50"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </AuthLayout>
  );
}
