"use client";

import { useEffect, useState } from "react";
import { toBlob } from "html-to-image";
import clsx from "clsx";
import Users from "@/components/Users";
import { useRouter, useSearchParams } from "next/navigation";

interface User {
  name: string;
  money: number;
}

interface Action {
  debitor: string;
  creditor: string;
  money: number;
}

export default function Home() {
  const router = useRouter();
  const queryParams = useSearchParams();
  const [result, setResult] = useState<[string, number][]>([]);
  const [limitBuyIn, setLimitBuyIn] = useState(200);
  const [actions, setActions] = useState<Action[]>([]);
  const [users, setUsers] = useState<string[]>(() => {
    let persistedUsers: string | null = null;
    const href = typeof window !== "undefined" ? window.location.href : "";
    const sharedUsers = href
      ? new URL(decodeURI(encodeURI(href))).searchParams.get("users") || ""
      : "";

    if (!sharedUsers) {
      const localStorage = typeof window !== "undefined" ? window.localStorage : null;
      persistedUsers = localStorage ? localStorage.getItem("users") : "";
    } else {
      persistedUsers = JSON.parse(sharedUsers);
      localStorage.setItem("users", persistedUsers || "");
    }

    return JSON.parse(persistedUsers || '["bank"]');
  });
  const [transactions, setTransactions] = useState<
    { debitor: string; creditor: string; money: number }[]
  >(() => {
    let persistedTransactions: string | null = null;
    const href = typeof window !== "undefined" ? window.location.href : "";
    const sharedTransactions = href
      ? new URL(decodeURI(encodeURI(href))).searchParams.get("transactions") || ""
      : "";

    if (!sharedTransactions) {
      const localStorage = typeof window !== "undefined" ? window.localStorage : null;
      persistedTransactions = localStorage ? localStorage.getItem("transactionsV2") : "";
    } else {
      persistedTransactions = JSON.parse(sharedTransactions);
      localStorage.setItem("transactionsV2", persistedTransactions || "");
    }

    return JSON.parse(persistedTransactions || "[]");
  });

  const overBuyInUsers = result.filter(([, money]) => money <= -limitBuyIn).map(([name]) => name);

  const calculateMoney = (shouldScroll: boolean) => {
    const obj: Record<string, number> = {};
    try {
      transactions.forEach((line) => {
        const { debitor, creditor, money } = line;

        let parsedMoney = 0;
        parsedMoney = Number(money);

        if (isNaN(parsedMoney)) {
          alert("Invalid transaction");

          return;
        }

        if (!parsedMoney) {
          return;
        }

        if (obj[debitor] === undefined) {
          obj[debitor] = 0;
        }

        if (obj[creditor] === undefined) {
          obj[creditor] = 0;
        }

        obj[debitor] -= parsedMoney;
        obj[creditor] += parsedMoney;
      });

      setResult(() => {
        const sortedObj = Object.entries(obj).sort((a, b) => b[1] - a[1]);
        generateResult(sortedObj);

        return sortedObj;
      });

      const resultDiv = document.getElementById("result");

      if (resultDiv && shouldScroll) {
        resultDiv.scrollIntoView({ behavior: "smooth" });
      }
    } catch (e) {
      console.log(e);
    }
  };

  const generateResult = (r: [string, number][]) => {
    const debitors: User[] = [];
    const creditors: User[] = [];

    r.forEach(([name, money]) => {
      if (money > 0) {
        creditors.push({ name, money });
      }
      if (money < 0) {
        debitors.push({ name, money });
      }
    });

    creditors.sort((a, b) => b.money - a.money);
    debitors.sort((a, b) => a.money - b.money);

    let debitorIndex = 0;
    let creditorIndex = 0;
    const listAction = [];

    while (debitorIndex < debitors.length && creditorIndex < creditors.length) {
      const debitor = debitors[debitorIndex];
      const creditor = creditors[creditorIndex];
      const action: Action = {} as Action;

      const money = Math.min(Math.abs(debitor.money), Math.abs(creditor.money));

      debitor.money += money;
      creditor.money -= money;

      if (debitor.money === 0) {
        debitorIndex++;
      }

      if (creditor.money === 0) {
        creditorIndex++;
      }

      action.debitor = debitor.name;
      action.creditor = creditor.name;
      action.money = money;
      listAction.push(action);
    }

    listAction.sort((a, b) => {
      if (a.debitor === b.debitor) {
        return b.money - a.money;
      }

      return a.debitor.localeCompare(b.debitor);
    });
    setActions([...listAction]);
  };

  const copyResultAsText = () => {
    const exportedText = actions
      .map(({ debitor, creditor, money }) => `"${debitor} -> ${creditor} = ${money}"`)
      .join("\n");

    navigator.clipboard.write([
      new ClipboardItem({
        "text/plain": new Promise(async (resolve, reject) => {
          try {
            resolve(
              new Blob([`/simplepoll "payment" ${exportedText} no-preview`], { type: "text/plain" })
            );
          } catch (err) {
            reject(err);
          }
        }),
      }),
    ]);
  };

  useEffect(() => {
    const copyImageToClipboard = async () => {
      try {
        const node = document.getElementById("finalResult");

        if (!node || actions.length === 0) {
          return;
        }

        const blob = await toBlob(node);

        navigator.clipboard.write([
          new ClipboardItem({
            "image/png": new Promise(async (resolve, reject) => {
              try {
                resolve(new Blob([blob!], { type: "image/png" }));
              } catch (err) {
                reject(err);
              }
            }),
          }),
        ]);
        // const item = new ClipboardItem({ "image/png": dataUrl });
        // await navigator.clipboard.write([item]);
        console.log("Fetched image copied.");
      } catch (error) {
        console.error("oops, something went wrong!", error);
      }
    };

    copyImageToClipboard();
  }, [actions]);

  useEffect(() => {
    calculateMoney(false);
    localStorage.setItem("transactionsV2", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    if (queryParams.get("transactions") || queryParams.get("users")) {
      router.push("/v2", { shallow: true });
    }
  }, []);

  return (
    <div className="flex flex-col justify-center items-center w-full h-full mt-4 md:mt-8 px-2 md:px-0">
      <Users
        users={users}
        setUsers={setUsers}
        limitBuyIn={limitBuyIn}
        setLimitBuyIn={setLimitBuyIn}
        overBuyInUsers={limitBuyIn === -1 ? [] : overBuyInUsers}
        //@ts-ignore
        setTransactions={setTransactions}
      />

      <div className="max-w-[1290px] mx-auto order-5 w-full">
        <div
          id="finalResult"
          className="flex flex-col-reverse md:flex-row justify-evenly w-full bg-white"
        >
          <div>
            <p className="text-lg font-medium text-center mb-4 bg-white">
              Transactions : {transactions.length}
            </p>
            <div className="border border-gray-500 w-full md:w-[220px] lg:w-[350px] min-h-[600px] p-4 placeholder-slate-400">
              {transactions.map((t, index) => {
                return (
                  <div key={`${t.debitor}${t.creditor}${t.money}${index}`}>
                    <span className="text-red-600">{t.debitor}</span>
                    {"  "}
                    <span className="text-green-600">{t.creditor}</span>
                    {"  "}
                    {t.money}
                  </div>
                );
              })}
            </div>
          </div>
          <div id="result">
            <p className="text-lg font-medium text-center mb-4 bg-white">Result</p>
            <div className="border border-gray-500 w-full md:w-[220px] lg:w-[350px] min-h-[600px] p-4">
              {result.map(([name, money]) => {
                return (
                  <div className="flex flex-row justify-between" key={name}>
                    <span
                      className={clsx(money > 0 && "text-green-600", money < 0 && "text-red-600")}
                    >
                      {name}
                    </span>
                    <span>{money}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div>
            <p className="text-lg font-medium text-center mb-4">Actions</p>
            <div
              className="border border-gray-500 w-full md:w-[220px] lg:w-[350px] min-h-[600px] p-4 bg-white"
              id="actions"
            >
              {actions.map(({ debitor, creditor, money }) => {
                return (
                  <div
                    className="flex flex-row justify-between border-b py-1"
                    key={`${debitor}${creditor}`}
                  >
                    <span className="w-10 text-red-600">{debitor}</span>
                    <span>→</span>
                    <span className="w-10 text-green-600">{creditor}</span>
                    <span>=</span>
                    <span className="w-10">{money}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <div className="my-4 text-lg h-5 order-6">
        {result.length ? `There are ${result.length} players` : null}
      </div>
      <div className="flex md:justify-evenly w-full md:w-3/4 mx-auto max-w-[1280px] mt-6 order-4 md:order-last justify-between mb-4 flex-col md:flex-row">
        <button
          className="py-4 px-8 text-lg border rounded border-gray-500"
          onClick={() => calculateMoney(true)}
        >
          Calculate & copy result
        </button>
        <button
          className="py-4 px-8 text-lg border rounded border-gray-500 my-2 md:my-0 md:mx-10"
          onClick={copyResultAsText}
        >
          Parse to slack command
        </button>
        <button
          className="py-4 px-8 text-lg border rounded border-gray-500"
          onClick={() => {
            setResult([]);
            setActions([]);
            setTransactions([]);
            setUsers([]);
            localStorage.setItem("transactionsV2", "");
            localStorage.setItem("users", JSON.stringify(["bank"]));
          }}
        >
          Clear
        </button>
      </div>
    </div>
  );
}
