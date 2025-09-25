import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMutating } from "@tanstack/react-query";
import { MAX_PLAYTIME_HOURS } from "src/constants/config";
import { useSteam } from "src/services/mutations";

interface ConnectSteamProps {
  isOpen: boolean;
  isDarkMode: boolean;
}

export default function ConnectSteam({
  isOpen,
  isDarkMode,
}: ConnectSteamProps) {
  const [identifier, setIdentifier] = useState("");
  const connectToSteamMutation = useSteam();
  const isMutating = useIsMutating();

  function handleSubmit() {
    connectToSteamMutation.mutate(identifier);
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
              <h3>Connect to Steam</h3>
              {isMutating > 0 ? (
                <h4>Loading...</h4>
              ) : (
                <div>
                  <p>
                    Make sure your privacy settings in Steam are set to public.
                  </p>
                  <p>
                    This will add all games with a play time of less than{" "}
                    {MAX_PLAYTIME_HOURS} hours.
                  </p>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="form-group">
                      <label className="form-label">
                        <span>Username/SteamID:</span>
                        <input
                          className="form-input"
                          type="text"
                          value={identifier}
                          onChange={(e) => {
                            setIdentifier(e.target.value);
                          }}
                        />
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
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
