import { ChangeEvent, useRef, useState, MouseEvent } from "react";
import clsx from "clsx";

interface Transaction {
  debitor: string;
  creditor: string;
  money: number;
}

interface UsersProps {
  users: string[];
  overBuyInUsers: string[];
  limitBuyIn: number;
  setUsers: (u: string[]) => void;
  setTransactions: (t: Transaction[] | ((prevState: Transaction[]) => Transaction[])) => void;
  setLimitBuyIn: (l: number) => void;
}

const Users = ({
  overBuyInUsers = [],
  users = [],
  setUsers = (u: any) => void u,
  setTransactions,
  setLimitBuyIn,
  limitBuyIn,
}: UsersProps) => {
  const INTERMEDIARY = "Bank";
  const inputRef = useRef<HTMLInputElement>(null);
  const buyInRef = useRef<HTMLInputElement>(null);
  const limitBuyInRef = useRef<HTMLInputElement>(null);
  const [isShowConfig, setIsShowConfig] = useState<boolean>(true);
  const [file, setFile] = useState<File>();
  const fileReader = new FileReader();

  const [defaultBuyIn, setDefaultBuyIn] = useState<number>(100);
  const moneyOfTransactionInputRef = useRef<HTMLInputElement>(null);
  const [creditor, setCreditor] = useState<string>();
  const [debitor, setDebitor] = useState<string>();
  const [isCopyLoading, setIsCopyLoading] = useState<boolean>(false);

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return;
    }

    setFile(e.target.files[0]);
  };

  const parseDataFromCSV = (csv: string) => {
    const [header, ...rows] = csv.split("\n");
    const players = [INTERMEDIARY];
    const importedTransactions: Transaction[] = [];

    rows.filter(Boolean).forEach((row) => {
      const cells = row.split(",");
      const netValue = Number(cells[cells.length - 1]);
      const player = cells[0].split('"')[1];
      players.push(player);

      if (netValue > 0) {
        importedTransactions.push({
          money: netValue > 0 ? netValue : -netValue,
          debitor: INTERMEDIARY,
          creditor: player,
        } as Transaction);
      } else {
        importedTransactions.push({
          money: netValue > 0 ? netValue : -netValue,
          creditor: INTERMEDIARY,
          debitor: player,
        } as Transaction);
      }
    });

    setTransactions(importedTransactions);
    setUsers(players);

    const resultDiv = document.getElementById("actions");

    if (resultDiv) {
      resultDiv.scrollIntoView({ behavior: "smooth" });
    }
  };
  const handleOnSubmit = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (file) {
      fileReader.onload = function (event: ProgressEvent<FileReader>) {
        const csvOutput = event.target?.result;
        console.log(csvOutput);
        parseDataFromCSV(csvOutput as string);
      };
      fileReader.readAsText(file);
    }
  };

  const getBuyInValue = () => {
    if (!buyInRef.current) {
      return;
    }

    const value = Number(buyInRef.current.value);

    if (value <= 0) {
      return;
    }
    setDefaultBuyIn(value);
  };

  const copySharedLink = async () => {
    setIsCopyLoading(true);
    const storedTransactions = localStorage.getItem("transactionsV2") || "";
    const storedUsers = localStorage.getItem("users") || "";

    let sharedUrl = `${window.location.origin}/v2?transactions=${
      storedTransactions.length ? JSON.stringify(storedTransactions) : ""
    }&users=${storedUsers.length ? JSON.stringify(storedUsers) : ""}`;

    try {
      const res = await fetch(`https://api.tinyurl.com/create`, {
        method: "POST",
        body: JSON.stringify({ url: sharedUrl }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.tinyUrlApi}`,
        },
      });
      const data = await res.json();
      const tinyUrl = data?.data?.tiny_url || "";

      sharedUrl = tinyUrl || encodeURI(sharedUrl);
    } catch (err) {
      console.log(err);
    } finally {
      setIsCopyLoading(false);
      console.log(sharedUrl);

      navigator.clipboard.write([
        new ClipboardItem({
          "text/plain": new Promise(async (resolve, reject) => {
            try {
              resolve(
                new Blob([`${sharedUrl}`], {
                  type: "text/plain",
                })
              );
            } catch (err) {
              reject(err);
            }
          }),
        }),
      ]);
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Current Settings Display */}
      <div className="flex flex-col sm:flex-row gap-6 items-center justify-center py-2">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-slate-700">Default Buy-in:</span>
          <span className="text-xl font-bold text-blue-600">${defaultBuyIn}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-slate-700">Debt Limit:</span>
          <span className={clsx(
            "text-xl font-bold",
            limitBuyIn === -1 ? "text-red-600" : "text-amber-600"
          )}>
            {limitBuyIn === -1 ? "Unlimited" : `$${limitBuyIn}`}
          </span>
        </div>
      </div>

      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row gap-6 justify-between items-start">
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => setIsShowConfig((p) => !p)}
            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 rounded-lg font-medium transition-colors touch-manipulation"
          >
            {isShowConfig ? "Hide Controls" : "Show Controls"}
          </button>
          <button
            className="flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors touch-manipulation"
            onClick={copySharedLink}
            disabled={isCopyLoading}
          >
            {isCopyLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-3"></div>
                Copying...
              </>
            ) : (
              "Copy Shared URL"
            )}
          </button>
        </div>

        {/* CSV Import */}
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <div className="relative">
            <input
              type="file"
              id="csvFileInput"
              accept=".csv"
              onChange={handleOnChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="px-6 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 rounded-lg font-medium cursor-pointer transition-colors">
              Choose CSV File
            </div>
          </div>
          <button
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white rounded-lg font-medium transition-colors touch-manipulation"
            onClick={handleOnSubmit}
            disabled={!file}
          >
            Import CSV
          </button>
        </div>
      </div>

      {/* Configuration Section */}
      {isShowConfig && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-slate-50 rounded-lg border border-slate-200">
          {/* Buy-in Settings */}
          <div className="space-y-4">
            <h4 className="font-medium text-slate-900">Buy-in Settings</h4>
            <div className="space-y-3">
              <div className="space-y-2">
                <input
                  min={1}
                  ref={buyInRef}
                  name="buyIn"
                  type="number"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Default buy-in"
                />
                <button
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors touch-manipulation"
                  onClick={getBuyInValue}
                >
                  Confirm
                </button>
              </div>
              <div className="text-sm text-slate-600">
                Current default: <span className="font-medium">${defaultBuyIn}</span>
              </div>
            </div>
          </div>

          {/* Limit Settings */}
          <div className="space-y-4">
            <h4 className="font-medium text-slate-900">Limit Settings</h4>
            <div className="space-y-3">
              <div className="space-y-2">
                <input
                  min={1}
                  ref={limitBuyInRef}
                  disabled={limitBuyIn === -1}
                  name="limitBuyIn"
                  type="number"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 disabled:text-slate-500"
                  placeholder="Default limit: 200"
                />
                <button
                  disabled={limitBuyIn === -1}
                  className={clsx(
                    "w-full px-4 py-2 rounded-lg font-medium transition-colors touch-manipulation",
                    limitBuyIn === -1
                      ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                      : "bg-amber-600 hover:bg-amber-700 text-white"
                  )}
                  onClick={() => {
                    if (limitBuyInRef.current && Number(limitBuyInRef.current.value) > 0) {
                      setLimitBuyIn(Number(limitBuyInRef.current.value));
                      limitBuyInRef.current.value = "";
                    }
                  }}
                >
                  Set Limit
                </button>
              </div>
              <button
                className={clsx(
                  "w-full px-4 py-2 rounded-lg font-medium transition-colors touch-manipulation",
                  limitBuyIn === -1
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-slate-200 hover:bg-slate-300 text-slate-700"
                )}
                onClick={() => {
                  if (limitBuyIn > 0) {
                    setLimitBuyIn(-1);
                  } else {
                    setLimitBuyIn(Number(limitBuyInRef.current?.value) || 200);
                  }
                }}
              >
                {limitBuyIn === -1 ? "Remove Limit" : "No Limit Mode"}
              </button>
            </div>
          </div>

          {/* User Management */}
          <div className="space-y-4">
            <h4 className="font-medium text-slate-900">Add Users</h4>
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const formData = new FormData(form);
                const newUser = (Object.fromEntries(formData.entries()).user as string) || "";

                if (newUser && !users.includes(newUser)) {
                  setUsers([...users, newUser]);
                  localStorage.setItem("users", JSON.stringify([...users, newUser]));
                }
                if (inputRef.current) {
                  inputRef.current.value = "";
                }
              }}
            >
              <div className="space-y-2">
                <input
                  ref={inputRef}
                  placeholder="User name"
                  name="user"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors touch-manipulation"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Selection */}
      {users.length > 0 && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-6 justify-between items-start">
            <h4 className="font-semibold text-slate-900 text-lg">Select Users for Transaction</h4>
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-200 rounded border"></div>
                <span className="font-medium">Debitor</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-200 rounded border"></div>
                <span className="font-medium">Creditor</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-slate-200 rounded border border-dashed"></div>
                <span className="font-medium">Over limit</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {users.map((user) => {
              const isOverBuyIn = overBuyInUsers.includes(user);
              const isDebitor = debitor === user;
              const isCreditor = creditor === user;

              return (
                <button
                  key={user}
                  className={clsx(
                    "min-h-[60px] px-5 py-4 rounded-lg border-2 font-medium transition-all touch-manipulation",
                    isDebitor && "bg-red-200 border-red-400 text-red-800",
                    isCreditor && "bg-green-200 border-green-400 text-green-800",
                    !isDebitor &&
                      !isCreditor &&
                      !isOverBuyIn &&
                      "bg-white border-slate-300 hover:bg-slate-50 text-slate-900",
                    isOverBuyIn &&
                      "bg-slate-100 border-slate-300 border-dashed text-slate-500 cursor-not-allowed"
                  )}
                  onClick={() => {
                    if (debitor && creditor && user !== debitor && user !== creditor) {
                      return;
                    }

                    if (debitor === user) {
                      setDebitor(undefined);
                    } else if (creditor === user) {
                      setCreditor(undefined);
                    } else if (!debitor && !creditor) {
                      if (isOverBuyIn) {
                        alert(`No more buyin for ${user}`);
                        return;
                      }
                      setDebitor(user);
                    } else if (debitor && !creditor) {
                      if (debitor !== user) {
                        setCreditor(user);
                      }
                    } else if (!debitor && creditor) {
                      if (creditor !== user) {
                        setDebitor(user);
                      }
                    }
                  }}
                  disabled={isOverBuyIn}
                >
                  {user}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selection Status */}
      {((debitor || creditor) && !debitor) ||
        (!creditor && (
          <div
            className={clsx(
              "text-center bg-yellow-50 rounded-lg",
              !debitor || !creditor ? "p-0" : "border border-yellow-200 py-4 px-6"
            )}
          >
            <span className="text-yellow-800 font-medium">
              {debitor && !creditor
                ? `Selected debitor: ${debitor} (choose creditor)`
                : !debitor && creditor
                ? `Selected creditor: ${creditor} (choose debitor)`
                : null}
            </span>
          </div>
        ))}

      {/* Transaction Actions */}
      {debitor && creditor && (
        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <button
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-lg font-medium transition-colors touch-manipulation"
            disabled={!debitor || !creditor}
            onClick={() => {
              setTransactions((transactions) => {
                return [...transactions, { debitor, creditor, money: defaultBuyIn } as Transaction];
              });
              setDebitor(undefined);
              setCreditor(undefined);
            }}
          >
            Add ${defaultBuyIn}
          </button>

          <div className="flex flex-1 gap-2">
            <input
              min={1}
              ref={moneyOfTransactionInputRef}
              type="number"
              placeholder="Amount"
              className="flex-1 px-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white rounded-lg font-medium transition-colors touch-manipulation"
              disabled={!debitor || !creditor}
              onClick={(e) => {
                e.preventDefault();
                const money = moneyOfTransactionInputRef.current?.value || 0;
                if (!money || Number(money) <= 0) {
                  return;
                }
                setTransactions((transactions) => {
                  return [...transactions, { debitor, creditor, money: +money } as Transaction];
                });

                if (moneyOfTransactionInputRef.current) {
                  moneyOfTransactionInputRef.current.value = "";
                }
                setDebitor(undefined);
                setCreditor(undefined);
              }}
            >
              Add Custom
            </button>
          </div>
        </div>
      )}

      {/* Success Status */}
      {debitor && creditor && (
        <div className="text-center py-4 px-6 bg-green-50 border border-green-200 rounded-lg">
          <span className="text-green-800 font-medium">
            Ready to create transaction: {debitor} → {creditor}
          </span>
        </div>
      )}
    </div>
  );
};

export default Users;
