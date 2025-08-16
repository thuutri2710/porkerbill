"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { toBlob } from "html-to-image";
import Users from "@/components/Users";
import TransactionsList from "@/components/TransactionsList";
import ResultDisplay from "@/components/ResultDisplay";
import ActionDisplay from "@/components/ActionDisplay";
import ControlButtons from "@/components/ControlButtons";
import { useUsers, useTransactions } from "@/hooks";
import {
  calculateBalances,
  sortBalances,
  generateSettlementActions,
  getOverBuyInUsers,
} from "@/utils/calculations";
import { Action } from "@/types";

export default function Home() {
  const [result, setResult] = useState<[string, number][]>([]);
  const [limitBuyIn, setLimitBuyIn] = useState(200);
  const [actions, setActions] = useState<Action[]>([]);
  const [users, setUsers] = useUsers();
  const [transactions, setTransactions] = useTransactions();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Memoize overBuyInUsers calculation to avoid recalculating on every render
  const overBuyInUsers = useMemo(() => {
    return getOverBuyInUsers(result, limitBuyIn);
  }, [result, limitBuyIn]);

  // Wrap calculateMoney in useCallback to prevent recreation on every render
  const calculateMoney = useCallback(
    (shouldScroll: boolean) => {
      setIsLoading(true);
      setError(null);

      try {
        // Check if there are transactions to calculate
        if (transactions.length === 0) {
          setError("No transactions to calculate");
          setIsLoading(false);
          return;
        }

        // Calculate balances for all users
        const balances = calculateBalances(transactions);

        // Sort balances from highest to lowest
        const sortedBalances = sortBalances(balances);

        // Set the result state
        setResult(sortedBalances);

        // Generate settlement actions
        const settlementActions = generateSettlementActions(sortedBalances);
        setActions(settlementActions);

        // Scroll to results if needed
        const resultDiv = document.getElementById("actions");
        if (resultDiv && shouldScroll) {
          resultDiv.scrollIntoView({ behavior: "smooth" });
        }
      } catch (e) {
        console.error("Error calculating money:", e);
        setError(e instanceof Error ? e.message : "An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    },
    [transactions]
  );

  // Copy result as image when actions change
  useEffect(() => {
    const copyImageToClipboard = async () => {
      if (actions.length === 0) return;

      // Check if document is focused before attempting clipboard write
      if (!document.hasFocus()) {
        console.log("Document not focused, skipping clipboard copy");
        return;
      }

      try {
        setError(null);
        const node = document.getElementById("finalResult");

        if (!node) {
          console.warn("Result element not found");
          return;
        }

        const blob = await toBlob(node);
        if (!blob) {
          setError("Failed to generate image from results");
          return;
        }

        await navigator.clipboard.write([
          new ClipboardItem({
            "image/png": new Blob([blob], { type: "image/png" }),
          }),
        ]);

        // Show temporary success message (could use a toast notification library here)
        const tempMessage = "Result image copied to clipboard";
        console.log(tempMessage);
      } catch (error) {
        console.error("Error copying image to clipboard:", error);
        // Only set error for non-focus related issues
        if (error instanceof Error && !error.message.includes("Document is not focused")) {
          setError(error.message);
        }
      }
    };

    copyImageToClipboard();
  }, [actions]);

  // Recalculate when transactions change
  useEffect(() => {
    if (transactions.length === 0) {
      return;
    }

    calculateMoney(false);
  }, [calculateMoney]);

  // Handle clearing all data
  const handleClear = () => {
    setResult([]);
    setActions([]);
    setTransactions([]);
    setUsers(["bank"]);
    localStorage.setItem("transactionsV2", "");
    localStorage.setItem("users", JSON.stringify(["bank"]));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Simple Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Porkerbill</h1>
          <p className="text-gray-600">Split expenses and settle debts</p>
        </div>

        {/* User Controls */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <Users
            users={users}
            setUsers={setUsers}
            limitBuyIn={limitBuyIn}
            setLimitBuyIn={setLimitBuyIn}
            overBuyInUsers={overBuyInUsers}
            setTransactions={setTransactions}
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Main Content */}
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-20 rounded-lg">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600"></div>
                <p className="mt-2 text-gray-600">Calculating...</p>
              </div>
            </div>
          )}
          
          <div
            id="finalResult"
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6"
          >
            <TransactionsList transactions={transactions} />
            <ResultDisplay result={result} />
            <ActionDisplay actions={actions} />
          </div>
        </div>
        
        {/* Player Count */}
        {result.length > 0 && (
          <div className="text-center mb-6">
            <div className="inline-block bg-blue-50 text-blue-800 px-4 py-2 rounded-lg text-sm font-medium">
              {result.length} players total
            </div>
          </div>
        )}
        
        {/* Control Buttons */}
        <ControlButtons 
          onCalculate={calculateMoney}
          onClear={handleClear}
          actions={actions}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
