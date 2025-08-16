import React from "react";
import clsx from "clsx";

interface ResultDisplayProps {
  result: [string, number][];
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border" id="result">
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Balance Summary
        </h3>
      </div>
      <div className="p-4">
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {result.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg">No balances calculated</p>
              <p className="text-sm">Add transactions and calculate to see results</p>
            </div>
          ) : (
            result.map(([name, money]) => (
              <div 
                key={name}
                className="flex items-center justify-between p-3 bg-gray-50 rounded border hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <div className={clsx(
                    "w-3 h-3 rounded-full",
                    money > 0 && "bg-green-500",
                    money < 0 && "bg-red-500",
                    money === 0 && "bg-gray-400"
                  )}></div>
                  <span className="font-medium text-gray-900">{name}</span>
                </div>
                <div className={clsx(
                  "font-semibold px-2 py-1 rounded",
                  money > 0 && "text-green-700 bg-green-100",
                  money < 0 && "text-red-700 bg-red-100",
                  money === 0 && "text-gray-700 bg-gray-100"
                )}>
                  {money > 0 ? '+' : ''}${Math.abs(money)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;
