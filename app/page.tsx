"use client";

import { use, useRef, useState } from "react";

export default function Home() {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const buyInRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<Record<string, number>>({});
  const [buyIn, setBuyIn] = useState<number>(50);
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

    setResult(obj);
  };

  return (
    <div className="flex flex-col justify-center items-center w-full h-full mt-16">
      <div>
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
      <div className="text-center my-4 text-lg">
        Default buy in is <b>{buyIn}</b>
      </div>
      <div className="flex flex-row justify-evenly w-full">
        <div>
          <p className="text-lg font-medium text-center mb-4">Transactions</p>
          <textarea
            ref={inputRef}
            className="border border-gray-500 w-[500px] min-h-[600px] p-4 placeholder-slate-400"
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
        <div>
          <p className="text-lg font-medium text-center mb-4">Result</p>
          <div className="border border-gray-500 w-[500px] min-h-[600px] p-4">
            {Object.entries(result).map(([name, money]) => {
              return (
                <div className="flex flex-row justify-between" key={name}>
                  <span>{name}</span>
                  <span>{money}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="flex justify-evenly w-1/2 mt-10">
        <button
          className="py-4 px-8 text-lg border rounded border-gray-500"
          onClick={calculateMoney}
        >
          Calculate
        </button>
        <button
          className="py-4 px-8 text-lg border rounded border-gray-500"
          onClick={() => {
            setResult({});
            inputRef.current!.value = "";
          }}
        >
          Clear
        </button>
      </div>
    </div>
  );
}
