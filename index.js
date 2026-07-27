// index.js
const { chat } = require("./ollama");
const readline = require("readline");
const tools = require("./server/tools"); 
const { runCommand } = require("./server/core/commandRunner"); 

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const conversationHistory = [];


// NEW: seed history with the system prompt, once, before any user turns
const conversationHistory = [{ role: "system", content: SYSTEM_PROMPT }];

async function main() {
  console.log("🤖 ASTRA AI is running. Type your command (or 'exit' to quit).\n");

  const ask = () => {
    rl.question("You: ", async (input) => {
      if (input.toLowerCase() === "exit") {
        console.log("Shutting down ASTRA...");
        rl.close();
        return;
      }

      // Add user message to history
      conversationHistory.push({ role: "user", content: input });

      try {
        const reply = await chat(conversationHistory);

         // NEW: try to parse the model's reply as an action
        const parsed = tryParseJSON(reply);

        if (!parsed || !validateAction(parsed)) {
          // model just chatted in plain text
        console.log(`\nASTRA: ${reply}\n`);
        }
        else{
          const executor = tools[parsed.action];
          const result = await runCommand(parsed.action, parsed.params, executor);

          if (!result.ok) {
            console.log(`\nASTRA: (couldn't do that — ${result.reason}) ${parsed.reply}\n`);
          } else {
            console.log(`\nASTRA: ${parsed.reply}\n`);
          }
        }

        // Add assistant reply to history (multi-turn memory)
        conversationHistory.push({ role: "assistant", content: reply });
      } catch (err) {
        console.error("Error talking to Ollama:", err.message);
      }

      ask(); // loop
    });
  };

  ask();
}

main();