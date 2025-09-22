import { useState } from "react";
import AddGame from "./AddGame";
import SuggestGame from "./SuggestGame";

interface HeaderProps {
  onLogout: () => void;
  isDarkMode: boolean;
}

export default function AppHeader({ onLogout, isDarkMode }: HeaderProps) {
  const [panel, setPanel] = useState<"add" | "suggest" | null>(null);

  return (
    <div>
      <header className="header header-nav">
        <button
          className="btn-primary"
          onClick={() => setPanel(panel === "add" ? null : "add")}
        >
          {panel === "add" ? "Hide" : "Add Game"}
        </button>

        <button
          className="btn-primary"
          onClick={() => setPanel(panel === "suggest" ? null : "suggest")}
        >
          {panel === "suggest" ? "Hide" : "Suggest Game"}
        </button>

        <button className="btn-primary" onClick={onLogout}>
          Logout
        </button>
      </header>

      <div>
        <AddGame
          resetForm={() => setPanel(null)}
          isOpen={panel === "add"}
          isDarkMode={isDarkMode}
        />
        <SuggestGame isOpen={panel === "suggest"} isDarkMode={isDarkMode} />
      </div>
    </div>
  );
}
