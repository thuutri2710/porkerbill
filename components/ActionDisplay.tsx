import React from "react";
import { Action } from "@/types";

interface ActionDisplayProps {
  actions: Action[];
}

export const ActionDisplay: React.FC<ActionDisplayProps> = ({ actions }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Settlement Actions ({actions.length})
        </h3>
      </div>
      <div className="p-4">
        <div 
          className="space-y-2 max-h-96 overflow-y-auto scroll-mt-2"
          id="actions"
        >
          {actions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg">No actions needed</p>
              <p className="text-sm">Calculate to see settlement actions</p>
            </div>
          ) : (
            actions.map(({ debitor, creditor, money }, index) => (
              <div
                key={`${debitor}${creditor}${index}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded border hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-2 flex-1">
                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm font-medium">
                    {debitor}
                  </span>
                  <span className="text-gray-400">→</span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm font-medium">
                    {creditor}
                  </span>
                </div>
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded font-semibold">
                  ${money}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ActionDisplay;
