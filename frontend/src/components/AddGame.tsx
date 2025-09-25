import { useState } from "react";
import { PLATFORMS, type PlatformName } from "src/constants/platforms";
import { statusOptions, type StatusKey } from "src/constants/statuses";
import { useCreateGame } from "src/services/mutations";
import { motion, AnimatePresence } from "framer-motion";

interface AddGameProps {
  resetForm: () => void;
  isOpen: boolean;
  isDarkMode: boolean;
}

export default function AddGame({
  resetForm,
  isOpen,
  isDarkMode,
}: AddGameProps) {
  const [title, setTitle] = useState<string>("");
  const [platform, setPlatform] = useState<PlatformName>("PC");
  const [status, setStatus] = useState<StatusKey>("backlog");

  const createGameMutation = useCreateGame(resetForm);

  function resetToDefaults() {
    setTitle("");
    setPlatform("PC");
    setStatus("backlog");
  }

  function handleSubmit() {
    createGameMutation.mutate({
      title,
      platform,
      status,
    });
    resetToDefaults();
  }

  return (
    <div className="overflow-hidden contain-paint">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            layout
            key="AddGameComponent"
            initial={{ y: -100, opacity: 0 }} // start above the header
            animate={{ y: 0, opacity: 1 }} // slide down into place
            exit={{ y: -100, opacity: 0 }} // slide back up when closing
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="motion-container"
          >
            <div
              className={`p-4 m-3 rounded-lg shadow ${
                isDarkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <h3>Add Game</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="form-group">
                  <label className="form-label">
                    <span>Title:</span>
                    <input
                      className="form-input"
                      type="text"
                      value={title}
                      placeholder="Title"
                      onChange={(e) => {
                        setTitle(e.target.value);
                      }}
                    />
                  </label>
                  <label className="form-label">
                    <span>Platform:</span>
                    <select
                      className="form-input"
                      value={platform}
                      onChange={(e) => {
                        const value = e.target.value as PlatformName;
                        setPlatform(value);
                      }}
                    >
                      {Object.keys(PLATFORMS).map((platfrom) => (
                        <option key={platfrom} value={platfrom}>
                          {platfrom}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="form-group">
                  <label className="form-label">
                    <span>Status:</span>
                    <select
                      className="form-input"
                      value={status}
                      onChange={(e) => {
                        const value = e.target.value as StatusKey;
                        setStatus(value);
                      }}
                    >
                      {statusOptions.map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleSubmit}
                >
                  Submit
                </button>
                <br />
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
