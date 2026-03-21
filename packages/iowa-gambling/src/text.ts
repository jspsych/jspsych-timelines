/**
 * Default text strings for the Iowa Gambling Task.
 * To translate, create a new object with the same structure and pass it to createTimeline().
 */
export const defaultText = {
  // -- INSTRUCTION PAGES --
  instruction_pages: [
    `<div style="max-width: 600px; margin: 0 auto; text-align: left;">
      <h2>Card Game</h2>
      <p>In this game, you will be selecting cards from four different decks.</p>
      <p>Each time you select a card, you will win some money. But sometimes you will also lose money.</p>
    </div>`,
    `<div style="max-width: 600px; margin: 0 auto; text-align: left;">
      <h2>Your Goal</h2>
      <p>Your goal is to win as much money as possible and avoid losing money.</p>
      <p>You will start with a loan. Try to make as much money as you can!</p>
    </div>`,
    `<div style="max-width: 600px; margin: 0 auto; text-align: left;">
      <h2>How to Play</h2>
      <p>Tap on any deck to select a card from it.</p>
      <p>You can select cards from any deck, in any order you wish.</p>
      <p>Some decks are better than others, but you will need to discover this on your own.</p>
    </div>`,
    `<div style="max-width: 600px; margin: 0 auto; text-align: left;">
      <h2>Ready?</h2>
      <p>You will play for 100 rounds.</p>
      <p>Good luck!</p>
    </div>`,
  ],

  // -- BUTTON LABELS --
  continue_button: "Continue",
  start_button: "Start",

  // -- DECK LABELS --
  deck_labels: ["A", "B", "C", "D"],

  // -- FEEDBACK --
  win_message: (amount: number, symbol: string) => `You win ${symbol}${amount}!`,
  loss_message: (amount: number, symbol: string) => `You lose ${symbol}${amount}`,
  net_win_message: (amount: number, symbol: string) => `Net: +${symbol}${amount}`,
  net_loss_message: (amount: number, symbol: string) => `Net: -${symbol}${Math.abs(amount)}`,
  no_loss_message: "No penalty this time!",

  // -- DISPLAY --
  total_label: "Total",
  borrowed_label: "Borrowed",
  trial_label: (current: number, total: number) => `Round ${current} of ${total}`,
  select_deck_prompt: "Select a deck",

  // -- COMPLETION --
  task_complete: "Task Complete",
  task_complete_score: (finalScore: number, symbol: string) =>
    `Game over! Your final score: ${symbol}${finalScore}`,
  result_summary: (finalScore: number, netScore: number, advantageousSelections: number) => `
    <div class="instructions">
      <h3>Your Results</h3>
      <p><strong>Final score:</strong> $${finalScore}</p>
      <p><strong>Net score:</strong> ${netScore >= 0 ? "+" : ""}$${netScore}</p>
      <p><strong>Advantageous selections:</strong> ${advantageousSelections}</p>
    </div>
  `,
};

// Export the type for use in other files
export type TextConfig = typeof defaultText;
