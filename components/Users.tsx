import { useRef, useState } from "react";
import clsx from "clsx";

interface Transaction {
  debitor: string;
  creditor: string;
  money: number;
}

interface UsersProps {
  users: string[];
  setUsers: (u: string[]) => void;
  setTransactions: (t: Transaction | ((prevState: Transaction[]) => Transaction[])) => void;
}

const Users = ({ users = [], setUsers = (u: any) => void u, setTransactions }: UsersProps) => {
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

  return (
    <div className="mb-6 w-full md:w-[800px] px-1 md:px-6">
      <div className="flex flex-col md:flex-row justify-between">
        <button
          onClick={() => {
            setIsShowConfig((p) => !p);
          }}
          className="grow-0 p-2 border border-solid border-black h-10 w-28 mb-4"
        >
          {isShowConfig ? "Hide" : "Show"}
        </button>
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
              <button className="border border-gray-500 px-4 py-2 ml-4" onClick={getBuyInValue}>
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
              <button type="submit" className="px-4 py-2 border border-solid border-black">
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
            <div className="flex flex-row items-center">
              <span>Creditor</span>
              <span className="w-6 h-6 inline-block ml-2 bg-green-200" />
            </div>
          </div>
          {users.map((user) => {
            return (
              <div
                className={clsx(
                  "border-2 border-solid border-black p-5",
                  debitor === user && "bg-red-200",
                  creditor === user && "bg-green-200"
                )}
                key={user}
                onClick={() => {
                  if (debitor === user) {
                    setDebitor(undefined);
                    //   setCreditor(undefined);
                  }

                  if (creditor === user) {
                    setCreditor(undefined);
                  }

                  if (!debitor && !creditor) {
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
            disabled={!debitor || !creditor || !moneyOfTransactionInputRef?.current?.value}
            onClick={(e) => {
              e.preventDefault();
              const money = moneyOfTransactionInputRef.current?.value || 0;
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
