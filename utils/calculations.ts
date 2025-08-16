import { Transaction, User, Action } from '@/types';

/**
 * Calculate balances for all users based on transactions
 */
export function calculateBalances(transactions: Transaction[]): Record<string, number> {
  const balances: Record<string, number> = {};
  
  transactions.forEach((transaction) => {
    const { debitor, creditor, money } = transaction;
    const parsedMoney = Number(money);
    
    if (isNaN(parsedMoney) || !parsedMoney) {
      return;
    }
    
    // Initialize balances if needed
    if (balances[debitor] === undefined) {
      balances[debitor] = 0;
    }
    
    if (balances[creditor] === undefined) {
      balances[creditor] = 0;
    }
    
    // Update balances
    balances[debitor] -= parsedMoney;
    balances[creditor] += parsedMoney;
  });
  
  return balances;
}

/**
 * Sort balances from highest to lowest
 */
export function sortBalances(balances: Record<string, number>): [string, number][] {
  return Object.entries(balances).sort((a, b) => b[1] - a[1]);
}

/**
 * Generate settlement actions based on sorted balances
 */
export function generateSettlementActions(sortedBalances: [string, number][]): Action[] {
  const debitors: User[] = [];
  const creditors: User[] = [];
  
  // Separate users into debitors and creditors
  sortedBalances.forEach(([name, money]) => {
    if (money > 0) {
      creditors.push({ name, money });
    }
    if (money < 0) {
      debitors.push({ name, money });
    }
  });
  
  // Sort by amount
  creditors.sort((a, b) => b.money - a.money);
  debitors.sort((a, b) => a.money - b.money);
  
  // Generate settlement actions
  let debitorIndex = 0;
  let creditorIndex = 0;
  const actions: Action[] = [];
  
  while (debitorIndex < debitors.length && creditorIndex < creditors.length) {
    const debitor = debitors[debitorIndex];
    const creditor = creditors[creditorIndex];
    
    // Calculate the transfer amount
    const transferAmount = Math.min(Math.abs(debitor.money), Math.abs(creditor.money));
    
    // Update balances
    debitor.money += transferAmount;
    creditor.money -= transferAmount;
    
    // Create action
    actions.push({
      debitor: debitor.name,
      creditor: creditor.name,
      money: transferAmount
    });
    
    // Move to next user if balance is settled
    if (debitor.money === 0) {
      debitorIndex++;
    }
    
    if (creditor.money === 0) {
      creditorIndex++;
    }
  }
  
  // Sort actions for better readability
  return actions.sort((a, b) => {
    if (a.debitor === b.debitor) {
      return b.money - a.money;
    }
    return a.debitor.localeCompare(b.debitor);
  });
}

/**
 * Identify users who are over the buy-in limit
 */
export function getOverBuyInUsers(sortedBalances: [string, number][], limitBuyIn: number): string[] {
  if (limitBuyIn === -1) return [];
  return sortedBalances
    .filter(([, money]) => money <= -limitBuyIn)
    .map(([name]) => name);
}

/**
 * Format actions as text for clipboard
 */
export function formatActionsAsText(actions: Action[]): string {
  return actions
    .map(({ debitor, creditor, money }) => `"${debitor} -> ${creditor} = ${money}"`)
    .join("\n");
}
