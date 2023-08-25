import { useRef, useState } from "react";
import clsx from "clsx";

interface Transaction {
  debitor: string;
  creditor: string;
  money: number;
}

interface UsersProps {
  users: string[];
  overBuyInUsers: string[];
  setUsers: (u: string[]) => void;
  setTransactions: (t: Transaction | ((prevState: Transaction[]) => Transaction[])) => void;
}

const Users = ({
  overBuyInUsers = [],
  users = [],
  setUsers = (u: any) => void u,
  setTransactions,
}: UsersProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const buyInRef = useRef<HTMLInputElement>(null);
  const [isShowConfig, setIsShowConfig] = useState<boolean>(true);

  const [defaultBuyIn, setDefaultBuyIn] = useState<number>(100);
  const moneyOfTransactionInputRef = useRef<HTMLInputElement>(null);
  const [creditor, setCreditor] = useState<string>();
  const [debitor, setDebitor] = useState<string>();

  const getBuyInValue = () => {
    if (!buyInRef.current) {
      return;
    }

    const value = Number(buyInRef.current.value);
    setDefaultBuyIn(value);
  };

  const copySharedLink = () => {
    const storedTransactions = localStorage.getItem("transactionsV2") || "";
    const storedUsers = localStorage.getItem("users") || "";

    const sharedUrl = `${window.location.origin}/v2?transactions=${
      storedTransactions.length ? JSON.stringify(storedTransactions) : ""
    }&users=${storedUsers.length ? JSON.stringify(storedUsers) : ""}`;

    navigator.clipboard.write([
      new ClipboardItem({
        "text/plain": new Promise(async (resolve, reject) => {
          try {
            resolve(
              new Blob([`${encodeURI(sharedUrl)}`], {
                type: "text/plain",
              })
            );
          } catch (err) {
            reject(err);
          }
        }),
      }),
    ]);
  };

  return (
    <div className="mb-6 w-full md:w-[800px] px-1 md:px-6">
      <div className="flex flex-col md:flex-row justify-between">
        <div>
          <button
            onClick={() => {
              setIsShowConfig((p) => !p);
            }}
            className="grow-0 p-2 border border-solid border-black h-10 w-28 mb-4 mr-4"
          >
            {isShowConfig ? "Hide" : "Show"}
          </button>
          <button
            className="grow-0 p-2 border border-solid border-black h-10 w-40 bg-blue-500 text-white mb-4 md:ml-0 ml-4"
            onClick={copySharedLink}
          >
            Copy shared link
          </button>
        </div>
        {isShowConfig && (
          <>
            <div className="mb-4 md:mb-0">
              <input
                min={0}
                ref={buyInRef}
                name="buyIn"
                type="number"
                className="border border-gray-500 w-40 h-10 p-2"
                placeholder="Default buy-in"
              />
              <button
                className="border border-gray-500 px-4 py-2 ml-4 md:ml-0 md:mt-4"
                onClick={getBuyInValue}
              >
                Confirm
              </button>
            </div>
            <form
              className="mb-4 md:mb-0"
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
                className="px-4 py-2 border-black border-solid border w-[200px] mr-2"
              />
              <button type="submit" className="px-4 py-2 border border-solid border-black md:mt-4">
                Add user
              </button>
            </form>
          </>
        )}
      </div>

      <hr className="my-2" />

      {users.length > 0 && (
        <div className="flex flex-wrap gap-4 border border-solid border-black p-4">
          <div>
            <div className="flex flex-row items-center mb-4">
              <span>Debitor</span>
              <span className="w-6 h-6 inline-block ml-2 bg-red-200" />
            </div>
            <div className="flex flex-row items-center mb-4">
              <span>Creditor</span>
              <span className="w-6 h-6 inline-block ml-2 bg-green-200" />
            </div>
            <div className="flex flex-row items-center">
              <span>No more buyin</span>
              <span className="w-6 h-6 inline-block ml-2 border-gray-100 border-4 text-gray-400 underline text-center align-middle pb-1">
                A
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
              if (!money) {
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
            min={0}
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
