// // Fetching 
// const fetch = (...args) =>
//     import("node-fetch").then(({ default: fetch }) => fetch(...args));

// const OLLAMA_URL = "http://localhost:11434/api/chat" // url for ollama
// const MODEL = "gemma3:4b";

// function sleep(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }

// async function chat(message, retries = 5 ) {
//     const response = await fetch(OLLAMA_URL, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//             model: MODEL,
//             messages: message,
//             stream: false, // get whole response all at once
//         }),

//     });
//     if(!response.ok){
//         throw new Error(`ollama error: ${response.status} ${response.StatusText}`);
//     }

//     const data = await response.json();
//      if (data.done_reason === "load") {
//         if (retries === 0) {
//             throw new Error("Model failed to load after multiple attempts.");
//         }
//         console.log(`⏳ Model is warming up, retrying in 3s... (${retries} attempts left)`);
//         await sleep(3000); // wait 3 seconds before retrying
//         return await chat(message, retries - 1);
//     }
//     return data.message.content
// }


// module.exports = {chat};