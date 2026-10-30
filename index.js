// // index.js
// const { chat } = require("./ollama");
// const readline = require("readline");
// const tools = require("./server/tools"); 
// const { runCommand } = require("./server/core/commandRunner"); 

// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout,
// });

// const conversationHistory = [];


// // NEW: seed history with the system prompt, once, before any user turns
// conversationHistory = [{ role: "system", content: SYSTEM_PROMPT }];

// async function main() {
//   console.log("🤖 ASTRA AI is running. Type your command (or 'exit' to quit).\n");

//   const ask = () => {
//     rl.question("You: ", async (input) => {
//       if (input.toLowerCase() === "exit") {
//         console.log("Shutting down ASTRA...");
//         rl.close();
//         return;
//       }

//       // Add user message to history
//       conversationHistory.push({ role: "user", content: input });

//       try {
//         const reply = await chat(conversationHistory);

//          // NEW: try to parse the model's reply as an action
//         const parsed = tryParseJSON(reply);

//         if (!parsed || !validateAction(parsed)) {
//           // model just chatted in plain text
//         console.log(`\nASTRA: ${reply}\n`);
//         }
//         else{
//           const executor = tools[parsed.action];
//           const result = await runCommand(parsed.action, parsed.params, executor);

//           if (!result.ok) {
//             console.log(`\nASTRA: (couldn't do that — ${result.reason}) ${parsed.reply}\n`);
//           } else {
//             console.log(`\nASTRA: ${parsed.reply}\n`);
//           }
//         }

//         // Add assistant reply to history (multi-turn memory)
//         conversationHistory.push({ role: "assistant", content: reply });
//       } catch (err) {
//         console.error("Error talking to Ollama:", err.message);
//       }

//       ask(); // loop
//     });
//   };

//   ask();
// }

// main();

// index.js
const readline = require("readline");
const tools = require("./server/tools"); 
const { askOllama, tryParseJSON, validateAction } = require("./server/ai.client/ollamaClient"); 

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Use let so we can update the history, and seed it initially (askOllama handles the system prompt)
let conversationHistory = [];

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
        // Send history to your Ollama client
        const reply = await askOllama(input, conversationHistory);
        const parsed = tryParseJSON(reply);

        if (!validateAction(parsed)) {
          // Model just chatted in plain text or returned invalid JSON
          console.log(`\nASTRA: ${reply}\n`);
        } else {
          // Execute the mapped tool
          const executor = tools[parsed.action];
          
          try {
            await executor(parsed.params);
            console.log(`\nASTRA: ${parsed.reply}\n`);
          } catch (toolError) {
            console.log(`\nASTRA: (Couldn't execute command — ${toolError.message}) ${parsed.reply}\n`);
          }
        }

        // Add assistant reply to history
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