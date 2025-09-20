import { motion, AnimatePresence } from "framer-motion";

interface SuggestGameProps {
  isOpen: boolean;
  isDarkMode: boolean;
}

export default function SuggestGame({ isOpen, isDarkMode }: SuggestGameProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.h1
          initial={{ y: -100, opacity: 0 }} // start above the header
          animate={{ y: 0, opacity: 1 }} // slide down into place
          exit={{ y: -100, opacity: 0 }} // slide back up when closing
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`p-4 m-3 rounded-lg shadow ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          Suggest Game component
        </motion.h1>
      )}
    </AnimatePresence>
  );
}
