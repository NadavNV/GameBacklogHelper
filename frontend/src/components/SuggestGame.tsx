import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { lengthsOptions, type LengthKey } from "src/constants/lengths";
import { PLATFORMS, type PlatformName } from "src/constants/platforms";
import Select from "./Select";
import type { SuggestData } from "src/types/SuggestData";
import SuggestionsTable from "./SuggestionsTable";

interface SuggestGameProps {
  isOpen: boolean;
  isDarkMode: boolean;
}

export default function SuggestGame({ isOpen, isDarkMode }: SuggestGameProps) {
  const [platform, setPlatform] = useState<PlatformName | "">("");
  const [length, setLength] = useState<LengthKey | "">("");
  const [showTable, setShowTable] = useState(false);
  const [suggestData, setSuggestData] = useState<SuggestData>({});

  // Reset when component closes
  useEffect(() => {
    if (!isOpen) {
      setPlatform("");
      setLength("");
      setShowTable(false);
    }
  }, [isOpen]);

  function handlePlatformChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value as PlatformName | "";
    setPlatform(value);
  }

  function handleLengthChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value as LengthKey | "";
    setLength(value);
  }

  function mapToOptions(key: string) {
    return { label: key, value: key };
  }

  const platformOptions = Object.keys(PLATFORMS).map(mapToOptions);
  const lengthOptions = lengthsOptions.map(([key, value]) => {
    return { label: value, value: key };
  });

  function handleSubmit() {
    setSuggestData({
      ...(platform && { platform }),
      ...(length && { length }),
    });
    setShowTable(true);
  }

  return (
    <div className="relative overflow-hidden">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="SuggestGameMotionDiv"
            initial={{ y: -50, opacity: 0 }} // start above the header
            animate={{ y: 0, opacity: 1 }} // slide down into place
            exit={{ y: -50, opacity: 0 }} // slide back up when closing
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-transparent"
          >
            <div
              className={`p-4 m-3 rounded-lg shadow overflow-hidden ${
                isDarkMode ? "bg-gray-800" : "bg-white"
              } `}
            >
              <h1>What kind of games are you looking for?</h1>
              <form className="space-y-4 max-w-md">
                <div className="form-group">
                  <Select
                    label="Platform"
                    onChange={handlePlatformChange}
                    options={[{ label: "", value: "" }, ...platformOptions]}
                    value={platform}
                    key="platform-select"
                  />
                  <Select
                    label="Length"
                    onChange={handleLengthChange}
                    options={[{ label: "", value: "" }, ...lengthOptions]}
                    value={length}
                    key="length-select"
                  />
                </div>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleSubmit}
                >
                  Suggest
                </button>
              </form>
              {showTable && <SuggestionsTable data={suggestData} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
