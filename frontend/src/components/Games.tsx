import { useState } from "react";
import { useGames } from "src/services/queries";
import { useDeleteGame, useUpdateGame } from "src/services/mutations";
import type { GameData } from "src/types/GameData";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { lengthsOptions, type LengthKey } from "src/constants/lengths";
import { statusOptions, type StatusKey } from "src/constants/statuses";
import type { DeleteData } from "src/types/DeleteData";

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
function interpolateColor(color1: string, color2: string, factor: number) {
  const hex = (c: string) => parseInt(c, 16);
  const r = Math.round(
    hex(color1.slice(1, 3)) +
      factor * (hex(color2.slice(1, 3)) - hex(color1.slice(1, 3)))
  );
  const g = Math.round(
    hex(color1.slice(3, 5)) +
      factor * (hex(color2.slice(3, 5)) - hex(color1.slice(3, 5)))
  );
  const b = Math.round(
    hex(color1.slice(5, 7)) +
      factor * (hex(color2.slice(5, 7)) - hex(color1.slice(5, 7)))
  );
  return `rgb(${r},${g},${b})`;
}

function getCellColor(
  value: string | number | undefined,
  type: "length" | "status" | "score"
) {
  if (value === "notAvailable" || value === undefined) return ""; // baseline color

  const startColor = "#44ce1b"; // green
  const endColor = "#e51f1f"; // red

  if (type === "length") {
    // Exclude the last "notAvailable" element
    const validOrder = lengthOrder.slice(0, lengthOrder.length - 1);
    const idx = validOrder.indexOf(value as string);
    const factor = idx / (validOrder.length - 1);
    return interpolateColor(startColor, endColor, factor);
  }

  if (type === "status") {
    const idx = statusOrder.indexOf(value as string);
    const factor = idx / (statusOrder.length - 1);
    return interpolateColor(startColor, endColor, factor);
  }

  if (type === "score") {
    const score = Math.min(Math.max(value as number, 0), 100); // clamp 0-100
    const factor = score / 100;
    return interpolateColor(endColor, startColor, factor);
  }

  return "";
}

// The main component of the app.
// Displays the games of the logged in user in a sortable table,
// enables removing a games from the database and changing a game's
// status or length. cells are color coded based on their values.
export default function Games() {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>({
    key: "title",
    direction: "asc",
  });
  // Query for fetching all games for this user
  const gamesQuery = useGames();
  const deleteGameMutation = useDeleteGame();
  const updateGameMutation = useUpdateGame();
  // The number of queries currently pending
  const isFetching = useIsFetching();
  // The number of mutations currently pending
  const isMutating = useIsMutating();

  const sortedGames = (gamesQuery.data ?? []).slice().sort((a, b) => {
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

  if (gamesQuery.isError) return <h1>Error loading games</h1>;
  if (isFetching || isMutating) return <h1>Loading...</h1>;

  return (
    <div className="max-w-5xl mx-auto px-4">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th
              key="delete-column"
              className="cursor-pointer px-4 py-2 border-r border-b"
            ></th>
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
              <td>{game.title}</td>
              <td>{game.platform}</td>
              <td
                style={{ backgroundColor: getCellColor(game.status, "status") }}
              >
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
              </td>
              <td
                style={{ backgroundColor: getCellColor(game.length, "length") }}
              >
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
