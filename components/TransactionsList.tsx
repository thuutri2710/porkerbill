import React from "react";
import { Transaction } from "@/types";

interface TransactionsListProps {
  transactions: Transaction[];
}

export const TransactionsList: React.FC<TransactionsListProps> = ({ transactions }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Transactions ({transactions.length})
        </h3>
      </div>
      <div className="p-4">
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg">No transactions yet</p>
              <p className="text-sm">Add some transactions to get started</p>
            </div>
          ) : (
            transactions.map((t, index) => (
              <div 
                key={`${t.debitor}${t.creditor}${t.money}${index}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded border hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-2 flex-1">
                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm font-medium">
                    {t.debitor}
                  </span>
                  <span className="text-gray-400">→</span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm font-medium">
                    {t.creditor}
                  </span>
                </div>
                <div className="font-semibold text-gray-900">
                  ${t.money}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionsList;
