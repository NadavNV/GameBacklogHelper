import { useState } from "react";
import { useApi } from "../services/api";

interface AuthFormProps {
  onAuth: (token: string) => void; // adjust as needed
}

export default function AuthForm({ onAuth }: AuthFormProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loginForm, setLoginForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");

  const { registerUser, loginUser } = useApi();

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError("");
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    try {
      const res = isRegistering
        ? await registerUser(
            registerForm.username,
            registerForm.email,
            registerForm.password
          )
        : await loginUser(loginForm.identifier, loginForm.password);
      const token = res.token || null;

      if (!token) throw new Error("No token returned from server");
      localStorage.setItem("token", token);
      onAuth(token);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === "object" && err && "response" in err) {
        // err is Axios error
        const axiosErr = err as {
          response?: { data?: { message?: string; error?: string } };
        };
        setError(
          axiosErr.response?.data?.message ||
            axiosErr.response?.data?.error ||
            "Authentication failed."
        );
      } else {
        setError("Authentication failed.");
      }
    }
  };
  if (isRegistering) {
    return (
      <div className="container flex-1 py-8">
        <h1>Register</h1>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <div className="form-group">
            <label className="form-label">
              <span>Username:</span>
              <input
                className="form-input"
                type="text"
                name="username"
                placeholder="Username"
                value={registerForm.username}
                onChange={handleRegisterChange}
                required
              />
            </label>
          </div>
          <div className="form-group">
            <label className="form-label">
              <span>E-mail:</span>
              <input
                className="form-input"
                type="text"
                name="email"
                placeholder="E-mail"
                value={registerForm.email}
                onChange={handleRegisterChange}
                required
              />
            </label>
          </div>
          <div className="form-group">
            <label className="form-label">
              <span>Password:</span>
              <input
                className="form-input"
                type="password"
                name="password"
                placeholder="Password"
                value={registerForm.password}
                onChange={handleRegisterChange}
                required
              />
            </label>
          </div>
          <button className="btn-primary w-full" type="submit">
            Register
          </button>
        </form>
        <br />
        <button className="btn-secondary" onClick={toggleMode}>
          Already have an account? Login
        </button>
        <br />
        {error && <p>{error}</p>}
      </div>
    );
  } else {
    return (
      <div className="container flex-1 py-8">
        <h1>Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <div className="form-group">
            <label className="form-label">
              <span>Username/E-mail:</span>
              <input
                className="form-input"
                type="text"
                name="identifier"
                placeholder="Username/E-mail"
                value={loginForm.identifier}
                onChange={handleLoginChange}
                required
              />
            </label>
          </div>
          <div className="form-group">
            <label className="form-label">
              <span>Password:</span>
              <input
                className="form-input"
                type="password"
                name="password"
                placeholder="Password"
                value={loginForm.password}
                onChange={handleLoginChange}
                required
              />
            </label>
          </div>
          <button className="btn-primary w-full" type="submit">
            Login
          </button>
        </form>
        <br />
        <button className="btn-secondary" onClick={toggleMode}>
          Don't have an account? Register
        </button>
        <br />
        {error && <p>{error}</p>}
      </div>
    );
  }
}
