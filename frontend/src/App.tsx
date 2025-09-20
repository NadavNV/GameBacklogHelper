import { useState, useEffect } from "react";
import AuthForm from "src/components/AuthForm";
import Games from "src/components/Games";
import AppHeader from "src/components/AppHeader";
import { useAuth } from "./contexts/useAuth";

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const { token, logout, setToken } = useAuth();

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Floating theme toggle button */}
      <button
        className="fixed top-4 right-4 z-50 btn-secondary"
        onClick={() => setDarkMode(!darkMode)}
      >
        {darkMode ? "Light Mode" : "Dark Mode"}
      </button>
      <main className="flex-1 px-4">
        {token ? (
          <div className="max-w-6xl mx-auto">
            <AppHeader onLogout={logout} isDarkMode={darkMode} />
            <Games />
          </div>
        ) : (
          <AuthForm onAuth={setToken} />
        )}
      </main>
      <footer className="footer">
        <p>
          Metacritic scores provided by <a href="https://rawg.io/">RAWG.io</a>
        </p>
      </footer>
    </div>
  );
}
