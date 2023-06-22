"use client";

import { useLayoutEffect, useRef, useState } from "react";

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
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const buyInRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<[string, number][]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [buyIn, setBuyIn] = useState<number>(50);

  useLayoutEffect(() => {
    if (!inputRef.current) {
      return;
    }

    const storedValue = localStorage.getItem("storedValue");

    if (storedValue) {
      inputRef.current.value = storedValue;
    }
  }, []);

  const getBuyInValue = () => {
    if (!buyInRef.current) {
      return;
    }

    const value = Number(buyInRef.current.value);
    setBuyIn(value);
  };

  const calculateMoney = () => {
    if (!inputRef.current) {
      return;
    }

    const obj: Record<string, number> = {};
    const input = inputRef.current.value;

    const lines = input.split("\n").filter(Boolean);

    lines.forEach((line) => {
      const [debtor, creditor, money = "50"] = line.split(" ");
      let times = 0;
      let parsedMoney = 0;
      if (money.startsWith("*")) {
        times = Number(money.split("*")?.[1]);

        if (isNaN(times)) {
          alert("Invalid transaction");
        }

        parsedMoney = buyIn * times;
      } else {
        parsedMoney = Number(money);
      }

      if (isNaN(parsedMoney)) {
        alert("Invalid transaction");

        return;
      }

      if (obj[debtor] === undefined) {
        obj[debtor] = 0;
      }

      if (obj[creditor] === undefined) {
        obj[creditor] = 0;
      }

      obj[debtor] -= parsedMoney;
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

  return (
    <div className="flex flex-col justify-center items-center w-full h-full mt-4 sm:mt-16 px-2 sm:px-0">
      <div className="order-1">
        <input
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
      <div className="text-center my-4 text-lg order-2">
        Default buy in is <b>{buyIn}</b>
      </div>
      <div className="flex flex-col sm:flex-row justify-evenly w-full order-5">
        <div>
          <p className="text-lg font-medium text-center mb-4">Transactions</p>
          <textarea
            onChange={(e) => {
              const input = e.target.value;
              localStorage.setItem("storedValue", input);
            }}
            ref={inputRef}
            className="border border-gray-500 w-full md:w-[400px] min-h-[600px] p-4 placeholder-slate-400"
            rows={inputRef.current?.value ? undefined : 5}
            placeholder={`debitor creditor money(optional, default = 50)

/*
\*  debitor creditor defaultMoney*times
*/            
debitor creditor *times   

e.g: 

jack rose
david jack 40
rose jack 30
jack david *2
`}
          ></textarea>
        </div>
        <div id="result">
          <p className="text-lg font-medium text-center mb-4">Result</p>
          <div className="border border-gray-500 w-full sm:w-[400px] min-h-[600px] p-4">
            {result.map(([name, money]) => {
              return (
                <div className="flex flex-row justify-between" key={name}>
                  <span>{name}</span>
                  <span>{money}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div>
          <p className="text-lg font-medium text-center mb-4">Actions</p>
          <div className="border border-gray-500 w-full sm:w-[400px] min-h-[600px] p-4">
            {actions.map(({ debitor, creditor, money }) => {
              return (
                <div className="flex flex-row justify-between" key={`${debitor}${creditor}`}>
                  <span className="w-10">{debitor}</span>
                  <span>→</span>
                  <span className="w-10">{creditor}</span>
                  <span>=</span>
                  <span className="w-10">{money}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="my-4 text-lg h-5 order-6">
        {result.length ? `There are ${result.length} players` : null}
      </div>
      <div className="flex sm:justify-evenly w-full sm:w-1/2 mt-6 order-4 sm:order-last justify-between">
        <button
          className="py-4 px-8 text-lg border rounded border-gray-500"
          onClick={calculateMoney}
        >
          Calculate
        </button>
        <button
          className="py-4 px-8 text-lg border rounded border-gray-500"
          onClick={() => {
            setResult([]);
            setActions([]);
            localStorage.setItem("storedValue", "");
            inputRef.current!.value = "";
          }}
        >
          Clear
        </button>
      </div>
    </div>
  );
}
