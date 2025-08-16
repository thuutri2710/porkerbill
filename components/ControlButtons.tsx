import React, { useState } from "react";
import { Action } from "@/types";
import { formatActionsAsText } from "@/utils/calculations";

interface ControlButtonsProps {
  onCalculate: (shouldScroll: boolean) => void;
  onClear: () => void;
  actions: Action[];
  isLoading?: boolean;
}

export const ControlButtons: React.FC<ControlButtonsProps> = ({
  onCalculate,
  onClear,
  actions,
  isLoading = false,
}) => {
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const copyResultAsText = async () => {
    if (actions.length === 0) return;

    const exportedText = formatActionsAsText(actions);
    const textToCopy = `/poll "payment" ${exportedText}`;

    try {
      // Try the modern clipboard API first
      await navigator.clipboard.writeText(textToCopy);
      setCopyStatus("Copied to clipboard!");

      // Clear the status after 2 seconds
      setTimeout(() => setCopyStatus(null), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
      setCopyStatus("Failed to copy");

      // Clear the error status after 2 seconds
      setTimeout(() => setCopyStatus(null), 2000);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-4xl mx-auto">
      <button
        className="w-full sm:w-auto min-h-[48px] px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg shadow-sm transition-colors duration-200 relative touch-manipulation"
        onClick={() => onCalculate(true)}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span className="opacity-0">Calculate & Copy Result</span>
            <span className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Calculating...</span>
              </div>
            </span>
          </>
        ) : (
          "Calculate & Copy Result"
        )}
      </button>
      
      <button
        className="w-full sm:w-auto min-h-[48px] px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg shadow-sm transition-colors duration-200 relative touch-manipulation"
        onClick={copyResultAsText}
        disabled={isLoading || actions.length === 0}
      >
        {copyStatus && (
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-3 py-1 rounded text-sm whitespace-nowrap z-10">
            {copyStatus}
          </div>
        )}
        Copy Slack Command
      </button>
      
      <button
        className="w-full sm:w-auto min-h-[48px] px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg shadow-sm transition-colors duration-200 touch-manipulation"
        onClick={onClear}
        disabled={isLoading}
      >
        Clear All
      </button>
    </div>
  );
};

export default ControlButtons;
