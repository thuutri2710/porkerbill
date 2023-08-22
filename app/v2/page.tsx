"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { toBlob } from "html-to-image";
import clsx from "clsx";
import Users from "@/components/Users";

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
  const [result, setResult] = useState<[string, number][]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [users, setUsers] = useState<string[]>(() => {
    const localStorage = typeof window !== "undefined" ? window.localStorage : null;
    const t = localStorage ? localStorage.getItem("users") : "";

    console.log(t);
    return JSON.parse(t || '["bank"]');
  });
  const isFirstRender = useRef(true);
  const [transactions, setTransactions] = useState<
    { debitor: string; creditor: string; money: number }[]
  >(() => {
    const localStorage = typeof window !== "undefined" ? window.localStorage : null;
    const t = localStorage ? localStorage.getItem("storedValueV2") : "";

    return JSON.parse(t || "[]");
  });

  const calculateMoney = () => {
    const obj: Record<string, number> = {};

    transactions.forEach((line) => {
      const { debitor, creditor, money } = line;

      let times = 0;
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

    if (resultDiv) {
      resultDiv.scrollIntoView({ behavior: "smooth" });
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
        console.log(blob);
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
    if (isFirstRender.current) {
      isFirstRender.current = false;

      return;
    }

    calculateMoney();
    localStorage.setItem("storedValueV2", JSON.stringify(transactions));
  }, [transactions]);

  return (
    <div className="flex flex-col justify-center items-center w-full h-full mt-4 md:mt-8 px-2 md:px-0">
      <Users
        users={users}
        setUsers={setUsers}
        //@ts-ignore
        setTransactions={setTransactions}
      />

      <div className="max-w-[1290px] mx-auto order-5 w-full">
        <div id="finalResult" className="flex flex-col md:flex-row justify-evenly w-full bg-white">
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
          onClick={calculateMoney}
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
            localStorage.setItem("storedValueV2", "");
            localStorage.setItem("users", JSON.stringify(["bank"]));
          }}
        >
          Clear
        </button>
      </div>
    </div>
  );
}