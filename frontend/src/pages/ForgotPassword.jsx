import { useState } from "react";
import AuthLayout from "../components/AuthLayout";
import axios from "axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email) {
      setError("Please enter your college email");
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        "http://localhost:5000/api/auth/forgot-password",
        { collegeEmail: email }
      );
      setMessage(
        "Password reset link generated. Please check your email."
      );
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(
        err.response?.data?.message || "Something went wrong"
      );
    }
  };

  return (
    <AuthLayout>
      <h1 className="text-3xl font-semibold mb-2">
        Forgot password
      </h1>
      <p className="text-gray-400 mb-8">
        Enter your registered college email
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <input
          type="email"
          placeholder="College Email"
          className="auth-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
          {loading ? "Sending..." : "Send reset link"}
        </button>
      </form>
    </AuthLayout>
  );
}
