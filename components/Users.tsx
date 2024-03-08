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
    <div className="mb-6 w-full md:w-[850px] px-1 md:px-6">
      <div className="flex flex-col md:flex-row justify-between">
        <div>
          <div className="flex flex-row md:flex-col pr-2">
            <button
              onClick={() => {
                setIsShowConfig((p) => !p);
              }}
              className="grow-0 p-2 border border-solid border-black h-10 w-28 mb-4 mr-4"
            >
              {isShowConfig ? "Hide" : "Show"}
            </button>
            <button
              className="flex justify-center items-center grow-0 p-2 border border-solid border-black h-10 w-40 bg-blue-500 text-white mb-4 md:ml-0 ml-4"
              onClick={copySharedLink}
            >
              {isCopyLoading ? (
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                "Copy shared URL"
              )}
            </button>
          </div>
          <form>
            <input type={"file"} id={"csvFileInput"} accept={".csv"} onChange={handleOnChange} />
            <button
              className="grow-0 p-2 border border-solid border-black h-10 w-full my-4"
              onClick={handleOnSubmit}
            >
              IMPORT CSV
            </button>
          </form>
        </div>
        {isShowConfig && (
          <>
            <div className="md:px-2 md:border-x md:border-gray-200">
              <div className="mb-4 md:mb-0 md:flex md:items-start">
                <input
                  min={1}
                  ref={buyInRef}
                  name="buyIn"
                  type="number"
                  className="border border-gray-500 w-40 h-10 p-2"
                  placeholder="Default buy-in"
                />
                <button
                  className="border border-gray-500 px-4 py-2 ml-2 md:ml-2 md:mt-0"
                  onClick={getBuyInValue}
                >
                  Confirm
                </button>
              </div>
              <div className="mb-4 md:mb-0 md:flex md:items-start mt-4">
                <input
                  min={1}
                  ref={limitBuyInRef}
                  name="limitBuyIn"
                  type="number"
                  className="border border-gray-500 w-40 h-10 p-2"
                  placeholder="Default limit: 200"
                />
                <button
                  className="border border-gray-500 px-4 py-2 ml-2 md:ml-2 md:mt-0"
                  onClick={() => {
                    if (limitBuyInRef.current && Number(limitBuyInRef.current.value) > 0) {
                      setLimitBuyIn(Number(limitBuyInRef.current.value));

                      limitBuyInRef.current.value = "";
                    }
                  }}
                >
                  Set limit buyin
                </button>
              </div>
            </div>
            <div className="md:pl-2 pl-0">
              <form
                className="md:mb-0 md:flex md:items-start"
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
                <input
                  ref={inputRef}
                  placeholder="user name"
                  name="user"
                  className="px-4 py-2 border-black border-solid border w-[180px] mr-2"
                />
                <button
                  type="submit"
                  className="px-4 py-2 border border-solid border-black md:mt-0"
                >
                  Add user
                </button>
              </form>
              <button
                className={clsx(
                  "px-4 py-2 border border-solid border-black my-4",
                  limitBuyIn === -1 && "bg-blue-500 text-white"
                )}
                onClick={() => {
                  if (limitBuyIn > 0) {
                    setLimitBuyIn(-1);
                  } else {
                    setLimitBuyIn(Number(limitBuyInRef.current?.value) || 200);
                  }
                }}
              >
                No limit buyin
              </button>
            </div>
          </>
        )}
      </div>

      <hr className="my-2" />

      {users.length > 0 && (
        <div className="flex flex-wrap gap-4 border border-solid border-black p-4">
          <div className="flex flex-row md:flex-col gap-2 items-center justify-center mb-2 md:mb-0 md:mr-6">
            <div className="flex flex-row items-center mb-4">
              <span>Debitor</span>
              <span className="w-6 h-6 inline-block ml-2 bg-red-200" />
            </div>
            <div className="flex flex-row items-center mb-4">
              <span>Creditor</span>
              <span className="w-6 h-6 inline-block ml-2 bg-green-200" />
            </div>
            <div className="flex flex-row items-start">
              <span>No more buyin</span>
              <span className="w-10 h-6 inline-block ml-2 border-gray-100 border-4 text-gray-400 underline text-center align-middle pb-1">
                ABC
              </span>
            </div>
          </div>
          {users.map((user) => {
            const isOverBuyIn = overBuyInUsers.includes(user);

            return (
              <div
                className={clsx(
                  "border-2 border-solid border-black p-5 cursor-pointer flex-grow-0 h-[70px]",
                  debitor === user && "bg-red-200",
                  creditor === user && "bg-green-200",
                  isOverBuyIn && "underline cursor-default border-gray-100 border-4 text-gray-400"
                )}
                key={user}
                onClick={() => {
                  if (debitor && creditor && user !== debitor && user !== creditor) {
                    return;
                  }

                  if (debitor === user) {
                    setDebitor(undefined);
                    //   setCreditor(undefined);
                  }

                  if (creditor === user) {
                    setCreditor(undefined);
                  }

                  if (!debitor && !creditor) {
                    if (isOverBuyIn) {
                      alert(`No more buyin for ${user}`);

                      return;
                    }
                    setDebitor(user);
                  }
                  if (debitor && !creditor) {
                    if (debitor !== user) {
                      setCreditor(user);
                    }
                  }
                  if (!debitor && creditor) {
                    if (creditor !== user) {
                      setDebitor(user);
                    }
                  }
                }}
              >
                {user}
              </div>
            );
          })}
        </div>
      )}
      <div className="mt-4 flex flex-row gap-4 md:gap-8 justify-between">
        <button
          className="px-4 py-2 border mb-4 border-solid border-black w-[250px]"
          disabled={!debitor || !creditor}
          onClick={() => {
            setTransactions((transactions) => {
              return [...transactions, { debitor, creditor, money: defaultBuyIn } as Transaction];
            });

            setDebitor(undefined);
            setCreditor(undefined);
          }}
        >
          Add default transaction <b>{defaultBuyIn}</b>
        </button>
        <form className="border-l pl-4 md:pl-0 border-0">
          <button
            type="submit"
            className="px-4 mb-4 md:mb-0 py-2 border border-solid border-black w-[215px]"
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
            Add transaction with
          </button>
          <input
            min={1}
            ref={moneyOfTransactionInputRef}
            type="number"
            name="transaction"
            className="px-4 py-2 border md:ml-4 border-solid border-black w-[100px]"
          />
        </form>
      </div>
    </div>
  );
};

export default Users;
