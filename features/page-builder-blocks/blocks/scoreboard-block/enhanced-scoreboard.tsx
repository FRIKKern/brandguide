"use client";

import { useState } from "react";
import { stegaClean } from "next-sanity";
import { Loader2, Search, Trophy, ArrowUpDown, Edit, Trash2 } from "lucide-react";
import { Modal } from "./modal";
import { AddParticipantForm } from "./add-participant-form";
import { useGlobalContext } from "@/features/context/global-context";
import { useEnhancedRealTimeParticipants } from "./enhanced-real-time-participants";
import { AdvancedConnectionIndicator } from "./advanced-connection-indicator";
import { optimisticEditParticipant, optimisticDeleteParticipant, isOptimisticParticipant } from "./optimistic-actions";
import { type Participant, type SortOption } from "./types";

// Main component interface
interface EnhancedScoreboardProps {
  participants: Participant[];
  initialSort: SortOption;
  title?: string;
  participantsQuery?: string;
}

/**
 * Enhanced Scoreboard Component with optimized real-time performance
 * 
 * Features:
 * - Adaptive connection management
 * - Intelligent batching of updates
 * - Optimistic UI updates
 * - Performance metrics and visual feedback
 * - Network quality detection and adaptation
 */
export default function EnhancedScoreboard({
  participants,
  initialSort,
  title,
  participantsQuery,
}: EnhancedScoreboardProps) {
  const [currentSort, setCurrentSort] = useState<SortOption>(initialSort);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editScore, setEditScore] = useState("");
  
  const { setIsScoreboardEditing } = useGlobalContext();
  
  // Use our enhanced real-time participants hook with optimistic updates
  const {
    participants: realTimeParticipants,
    isConnected,
    isConnecting,
    connectionQuality,
    lastUpdateTime,
    metrics,
    applyOptimisticUpdate,
    applyOptimisticDelete,
    reconnect
  } = useEnhancedRealTimeParticipants(
    participants,
    participantsQuery
  );
  
  // Handle search
  const filteredParticipants = realTimeParticipants.filter(participant =>
    participant.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Sort participants based on the selected option
  const getSortedParticipants = () => {
    const sortedParticipants = [...filteredParticipants];

    switch (currentSort) {
      case "latest":
        return sortedParticipants.sort((a, b) =>
          new Date(b._createdAt).getTime() - new Date(a._createdAt).getTime()
        );
      case "highest":
        return sortedParticipants.sort((a, b) => b.score - a.score);
      case "lowest":
        return sortedParticipants.sort((a, b) => a.score - b.score);
      case "alphabetical":
        return sortedParticipants.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
      default:
        return sortedParticipants;
    }
  };
  
  // Get sorted participants
  const sortedParticipants = getSortedParticipants();
  
  // Handle sort change
  const handleSortChange = (newSort: SortOption) => {
    if (newSort === currentSort) return;
    setCurrentSort(newSort);
  };
  
  // Handle opening the add participant modal
  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };
  
  // Handle closing the add participant modal
  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };
  
  // Handle starting edit mode for a participant
  const handleStartEdit = (participant: Participant) => {
    setEditingId(participant._id);
    setEditName(participant.name);
    setEditScore(participant.score.toString());
  };
  
  // Handle canceling edit mode
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditScore("");
  };
  
  // Handle saving edits
  const handleSaveEdit = async () => {
    if (!editingId) return;
    
    const scoreNumber = parseInt(editScore, 10);
    if (isNaN(scoreNumber) || scoreNumber < 0) return;
    
    setIsScoreboardEditing(true);
    const result = await optimisticEditParticipant(
      editingId, 
      editName, 
      scoreNumber, 
      applyOptimisticUpdate
    );
    
    if (result.error) {
      console.error("Failed to update participant:", result.error);
    } else {
      handleCancelEdit();
      setIsScoreboardEditing(false);
    }
  };
  
  // Handle deleting a participant
  const handleDelete = async (id: string) => {
    const result = await optimisticDeleteParticipant(id, applyOptimisticDelete);
    
    if (result.error) {
      console.error("Failed to delete participant:", result.error);
    }
  };
  
  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Main Card Container */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              {title ? stegaClean(title) : "Scoreboard"}
              <AdvancedConnectionIndicator
                isConnected={isConnected}
                isConnecting={isConnecting}
                connectionQuality={connectionQuality}
                lastUpdateTime={lastUpdateTime}
                metrics={metrics}
                position="header"
                onReconnect={reconnect}
              />
            </h2>

            <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
              {/* Search bar */}
              <div className="relative w-full md:w-48 lg:w-64">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-4 w-4 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  className="block w-full rounded-md border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Search participants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Search participants"
                />
              </div>

              {/* Sort options */}
              <div className="flex flex-wrap items-center bg-white rounded-md border border-gray-200 p-1 gap-0.5">
                <ArrowUpDown className="h-4 w-4 text-gray-500 ml-2 mr-1 hidden md:inline" aria-hidden="true" />
                <button
                  onClick={() => handleSortChange("latest")}
                  className={`rounded-md px-3 py-1.5 text-sm transition-all duration-75 cursor-pointer ${currentSort === "latest"
                    ? "bg-blue-100 font-medium text-blue-800 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                    }`}
                  aria-pressed={currentSort === "latest"}
                >
                  Latest
                </button>
                <button
                  onClick={() => handleSortChange("highest")}
                  className={`rounded-md px-3 py-1.5 text-sm transition-all duration-75 cursor-pointer ${currentSort === "highest"
                    ? "bg-blue-100 font-medium text-blue-800 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                    }`}
                  aria-pressed={currentSort === "highest"}
                >
                  Highest
                </button>
                <button
                  onClick={() => handleSortChange("lowest")}
                  className={`rounded-md px-3 py-1.5 text-sm transition-all duration-75 cursor-pointer ${currentSort === "lowest"
                    ? "bg-blue-100 font-medium text-blue-800 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                    }`}
                  aria-pressed={currentSort === "lowest"}
                  aria-label="Sort by lowest score"
                >
                  Lowest
                </button>
                <button
                  onClick={() => handleSortChange("alphabetical")}
                  className={`rounded-md px-3 py-1.5 text-sm transition-all duration-75 cursor-pointer ${currentSort === "alphabetical"
                    ? "bg-blue-100 font-medium text-blue-800 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                    }`}
                  aria-pressed={currentSort === "alphabetical"}
                >
                  A-Z
                </button>
              </div>

              <button
                onClick={handleOpenAddModal}
                className="flex items-center justify-center rounded-md bg-blue-600 px-4 py-2.5 font-medium text-white shadow-sm transition-all duration-75 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full md:w-auto cursor-pointer active:translate-y-0.5"
                aria-label="Add new participant"
              >
                <span className="mr-2">+</span>
                Add Participant
              </button>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="px-4 sm:px-6 py-5">
          {/* Participant content area */}
          <div className="relative bg-gray-50 rounded-lg p-3 sm:p-6 border border-gray-100">
            {/* Loading state */}
            {isLoading ? (
              <div className="flex h-40 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : sortedParticipants.length > 0 ? (
              <div className="space-y-3">
                {/* Participant list with real implementation */}
                {sortedParticipants.map((participant) => (
                  <div 
                    key={participant._id}
                    className={`bg-white rounded-lg border ${
                      isOptimisticParticipant(participant) 
                        ? 'border-blue-200 border border-[#00000010]  animate-pulse' 
                        : 'border-gray-200'
                    } p-4 transition-all duration-200`}
                  >
                    {editingId === participant._id ? (
                      // Edit mode
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex-grow">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 mb-2 sm:mb-0 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Participant name"
                          />
                        </div>
                        <div className="w-full sm:w-24">
                          <input
                            type="number"
                            value={editScore}
                            onChange={(e) => setEditScore(e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Score"
                            min="0"
                          />
                        </div>
                        <div className="flex gap-2 mt-2 sm:mt-0">
                          <button
                            onClick={handleSaveEdit}
                            className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-600 shadow-sm hover:bg-gray-200 focus:outline-none"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      // View mode
                      <div className="flex items-center justify-between">
                        <div className="flex-grow">
                          <h3 className="text-lg font-medium text-gray-900">
                            {participant.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Added {new Date(participant._createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'numeric',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <div className="bg-blue-50 text-blue-700 text-xl font-semibold px-4 py-2 rounded-md mr-4">
                            {participant.score}
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleStartEdit(participant)}
                              className="rounded p-2 text-gray-400 hover:bg-gray-100 hover:text-blue-600"
                              aria-label={`Edit ${participant.name}`}
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(participant._id)}
                              className="rounded p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600"
                              aria-label={`Delete ${participant.name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white p-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 mb-3">
                  <Trophy className="h-6 w-6 text-blue-500" aria-hidden="true" />
                </div>
                <p className="text-gray-500 text-center mb-2">{searchTerm ? "No matching participants found." : "No participants yet."}</p>
                <p className="text-sm text-gray-400 text-center mb-3">{searchTerm ? "Try a different search term or clear your search." : "Add your first participant to get started!"}</p>
              </div>
            )}
          </div>

          {/* Stats summary with connection indicator */}
          <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm overflow-hidden">
            <h4 className="mb-3 text-sm font-medium text-gray-700">Connection Status</h4>
            <AdvancedConnectionIndicator
              isConnected={isConnected}
              isConnecting={isConnecting}
              connectionQuality={connectionQuality}
              lastUpdateTime={lastUpdateTime}
              metrics={metrics}
              position="stats"
              onReconnect={reconnect}
            />
          </div>
        </div>
      </div>

      {/* Modal for adding new participants */}
      <Modal isOpen={isAddModalOpen} onClose={handleCloseAddModal}>
        <AddParticipantForm 
          onClose={handleCloseAddModal} 
          applyOptimisticUpdate={(participant) => {
            // Add the participant to the local state optimistically
            if (participant._id) {
              applyOptimisticUpdate(participant._id, participant);
            } else {
              // If no _id exists, we probably need to handle this case differently
              console.warn("Participant is missing _id property");
            }
          }}
        />
      </Modal>
    </div>
  );
} 