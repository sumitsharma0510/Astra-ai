// server/ai.client/ollamaClient.js

const { error } = require("../utils/logger");

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const OLLAMA_URL = "http://localhost:11434/api/chat";
const MODEL = "gemma3:4b";

const SYSTEM_PROMPT = `You are ASTRA, a desktop automation assistant.

You have access to these actions ONLY:
- open_app(app_name: string)
- type_text(text: string)
- key_press(key: string)
- none

CRITICAL RULES:
1. The user frequently closes applications manually. If the user asks you to open an app, ALWAYS output the "open_app" action, even if you already opened it previously in this conversation. Do not assume the app is still running.
2. If the user asks to open Google or a browser, always use the exact app_name "chrome".

Respond ONLY with a single JSON object, no markdown fences, no extra text:
{"action": "...", "params": {...}, "reply": "..."}

Examples:
User: "open notepad"
{"action":"open_app","params":{"app_name":"notepad"},"reply":"Opening Notepad now."}

User: "hey bro what's up"
{"action":"none","params":{},"reply":"Not much, just here! What do you need?"}`;

function sleep(ms){
    return new Promise((resolve)=>setTimeout(resolve,ms));
}

// logic
async function chat(messages, retires=5){
    const response = await fetch(OLLAMA_URL,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
            model:MODEL,
            messages:messages,
            stream:false,
        }),
    });
    if(!response.ok){
        throw new Error(`Ollama Error ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (data.done_reason === "load"){
        if(retires===0){
            throw new Error("model failed to load after multiple attempts");
        }
        console.log(`⏳model is Warming up, retrying in 3s... ( ${retires} attempts left)`);
        await sleep(3000);
        return await chat(messages, retires-1);
    }
    //return data.messages.content;

    // Check if Ollama returned the standard chat message structure
    if (data.message && data.message.content !== undefined) {
        return data.message.content;
    } 
    // Fallback just in case it used the /api/generate format
    else if (data.response !== undefined) {
        return data.response;
    } 
    // If the structure is completely unrecognized, log it to the terminal
    else {
        console.error("\n[DEBUG] Unexpected Ollama Response:", data, "\n");
        throw new Error("Ollama returned an unrecognized JSON format. See terminal for details.");
    }
}
// New: builds the message array with the system prompt baked in,
// so index.js never has to think about prompt engineering.
async function askOllama(userInput, history=[]){
    const messages=[
        {role:"system",content:SYSTEM_PROMPT},
        ...history
        // {role:"user",content: userInput},
    ];

    return await chat(messages);
}

function tryParseJSON(raw){
    try{
        const clean = raw.replace(/```json|```/g,"").trim();
        return JSON.parse(clean)
    }catch{
        return null;
    }
}


function validateAction(parsed){
    const validActions = ["open_app","type_text","key_press","none"];
    return parsed && validActions.includes(parsed.action) && typeof parsed.reply ==="string";
}


module.exports = { chat, askOllama, tryParseJSON, validateAction };