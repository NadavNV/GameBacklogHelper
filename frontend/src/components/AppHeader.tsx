import { useState } from "react";
import AddGame from "./AddGame";
import SuggestGame from "./SuggestGame";

interface HeaderProps {
  onLogout: () => void;
  isDarkMode: boolean;
}

export default function AppHeader({ onLogout, isDarkMode }: HeaderProps) {
  const [showAddGame, setShowAddGame] = useState(false);
  const [showSuggestGame, setShowSuggestGame] = useState(false);

  function toggleAddGame() {
    setShowSuggestGame(false);
    setShowAddGame(!showAddGame);
  }

  function toggleSuggestGame() {
    setShowAddGame(false);
    setShowSuggestGame(!showSuggestGame);
  }

  function hideAll() {
    setShowAddGame(false);
    setShowSuggestGame(false);
  }

  const header = (
    <header className="header">
      <button className="btn-primary" onClick={toggleAddGame}>
        {showAddGame ? "Hide" : "Add Game"}
      </button>

      <button className="btn-primary" onClick={toggleSuggestGame}>
        {showSuggestGame ? "Hide" : "Suggest Game"}
      </button>

      <button className="btn-primary" onClick={onLogout}>
        Logout
      </button>
    </header>
  );

  return (
    <div>
      {header}
      <AddGame
        resetForm={hideAll}
        isOpen={showAddGame}
        isDarkMode={isDarkMode}
      />
      <SuggestGame isOpen={showSuggestGame} isDarkMode={isDarkMode} />
    </div>
  );
}
