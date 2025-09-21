import { useState } from "react";
import { useDeleteGame, useUpdateGame } from "src/services/mutations";
import type { GameData } from "src/types/GameData";
import { LENGTHS, lengthsOptions, type LengthKey } from "src/constants/lengths";
import {
  STATUSES,
  statusOptions,
  type StatusKey,
} from "src/constants/statuses";
import type { DeleteData } from "src/types/DeleteData";

interface GameTableProps {
  games: GameData[];
  interactive: boolean;
  sortBy: "metacriticScore" | "title";
}

// By which column and in which direction to sort the table
interface SortConfig {
  key: keyof GameData;
  direction: "asc" | "desc";
}

// For sorting the table of games based on length or status
// in an order that makes sense, instead of alphabetically.
const lengthOrder = ["short", "medium", "long", "notAvailable"];
const statusOrder = ["backlog", "abandoned", "playing", "finished"];

const columns: (keyof GameData)[] = [
  "title",
  "platform",
  "status",
  "length",
  "metacriticScore",
];

const columnNames = {
  title: "Title",
  platform: "Platform",
  status: "Status",
  length: "Length",
  metacriticScore: "Score",
};

// Helper function to interpolate between two hex colors
function interpolateColor(
  startColor: string,
  midColor: string,
  endColor: string,
  factor: number
) {
  if (factor < 0.5) {
    endColor = midColor;
    factor /= 0.5;
  } else {
    startColor = midColor;
    factor = (factor - 0.5) / 0.5;
  }
  const hex = (c: string) => parseInt(c, 16);
  const r = Math.round(
    hex(startColor.slice(1, 3)) +
      factor * (hex(endColor.slice(1, 3)) - hex(startColor.slice(1, 3)))
  );
  const g = Math.round(
    hex(startColor.slice(3, 5)) +
      factor * (hex(endColor.slice(3, 5)) - hex(startColor.slice(3, 5)))
  );
  const b = Math.round(
    hex(startColor.slice(5, 7)) +
      factor * (hex(endColor.slice(5, 7)) - hex(startColor.slice(5, 7)))
  );
  return `rgb(${r},${g},${b})`;
}

const valueToColor = {
  short: "#44ce1b", // green
  medium: "#f2a134", // orange
  long: "#e51f1f", // red
  backlog: "#e51f1f", // red
  abandoned: "#f2a134", // orange
  playing: "#bbdb44", // lime green
  finished: "#44ce1b", // green
};

function getCellColor(
  value: string | number | undefined,
  type: "length" | "status" | "score"
) {
  if (value === "notAvailable" || value === undefined) return ""; // baseline color

  if (type === "length") {
    const lengthValue = value as keyof typeof valueToColor;
    return valueToColor[lengthValue];
  }

  if (type === "status") {
    const statusValue = value as keyof typeof valueToColor;
    return valueToColor[statusValue];
  }

  if (type === "score") {
    const startColor = "#e51f1f"; // red
    const midColor = "#f7e379"; // yellow
    const endColor = "#44ce1b"; // green
    const score = Math.min(Math.max(value as number, 0), 100); // clamp 0-100
    const factor = score / 100;
    return interpolateColor(startColor, midColor, endColor, factor);
  }

  return "";
}

// The main component of the app.
// Displays the games of the logged in user in a sortable table,
// enables removing a games from the database and changing a game's
// status or length. cells are color coded based on their values.
export default function GamesTable({
  games,
  interactive,
  sortBy,
}: GameTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>({
    key: sortBy,
    direction: sortBy === "title" ? "asc" : "desc",
  });
  const deleteGameMutation = useDeleteGame();
  const updateGameMutation = useUpdateGame();

  const sortedGames = (games ?? []).slice().sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;

    let aValue = a[key];
    let bValue = b[key];

    if (key === "length") {
      aValue = lengthOrder.indexOf(aValue as string);
      bValue = lengthOrder.indexOf(bValue as string);
    }

    if (key === "status") {
      aValue = statusOrder.indexOf(aValue as string);
      bValue = statusOrder.indexOf(bValue as string);
    }

    if (key === "metacriticScore") {
      aValue = aValue ?? -1;
      bValue = bValue ?? -1;
    }

    if (aValue! < bValue!) return direction === "asc" ? -1 : 1;
    if (aValue! > bValue!) return direction === "asc" ? 1 : -1;
    return 0;
  });

  const requestSort = (key: keyof GameData) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig?.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  function handleDeleteGame(data: DeleteData) {
    if (confirm(`Ar you sure you want to remove ${data.title}?`))
      deleteGameMutation.mutate(data);
  }

  return (
    <div className="max-w-5xl mx-auto px-4">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {interactive && (
              <th
                key="delete-column"
                className="cursor-pointer px-4 py-2 border-r border-b"
              ></th>
            )}
            {columns.map((col) => (
              <th
                key={col}
                onClick={() => requestSort(col as keyof GameData)}
                className="cursor-pointer px-4 py-2 border-r last:border-r-0 border-b min-w-[120px]"
              >
                <div className="flex justify-between items-center">
                  <span>{columnNames[col]}</span>
                  <span>
                    {sortConfig?.key === col
                      ? sortConfig.direction === "asc"
                        ? "▲"
                        : "▼"
                      : "↕"}
                  </span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="px-4 py-2 border-b last:border-b-0">
          {sortedGames.map((game) => (
            <tr
              key={JSON.stringify({
                title: game.title,
                platform: game.platform,
              })}
            >
              {interactive && (
                <td>
                  <button
                    className="btn-secondary"
                    onClick={() =>
                      handleDeleteGame({
                        title: game.title,
                        platform: game.platform,
                      })
                    }
                  >
                    Delete
                  </button>
                </td>
              )}
              <td>{game.title}</td>
              <td>{game.platform}</td>
              <td
                style={{ backgroundColor: getCellColor(game.status, "status") }}
              >
                {interactive ? (
                  <select
                    className="form-input bg-transparent border-none focus:ring-0 shadow-none"
                    value={game.status}
                    onChange={(e) => {
                      const value = e.target.value as StatusKey;
                      updateGameMutation.mutate({
                        title: game.title,
                        platform: game.platform,
                        newStatus: value,
                      });
                    }}
                  >
                    {statusOptions.map(([key, label]) => (
                      <option key={key} value={key} className="form-input">
                        {label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span>{STATUSES[game.status]}</span>
                )}
              </td>
              <td
                style={{ backgroundColor: getCellColor(game.length, "length") }}
              >
                {interactive ? (
                  <select
                    className="form-input bg-transparent border-none focus:ring-0 shadow-none"
                    value={game.length}
                    onChange={(e) => {
                      const value = e.target.value as LengthKey;
                      updateGameMutation.mutate({
                        title: game.title,
                        platform: game.platform,
                        newLength: value,
                      });
                    }}
                  >
                    {lengthsOptions.map(([key, label]) => (
                      <option key={key} value={key} className="form-input">
                        {label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span>{LENGTHS[game.length]}</span>
                )}
              </td>
              <td
                style={{
                  backgroundColor: getCellColor(game.metacriticScore, "score"),
                }}
              >
                {game.metacriticScore ?? "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
