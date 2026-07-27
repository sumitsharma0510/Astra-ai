const { warn } = require('console');
const fs =  require('fs');
const path = require('path');
const { json } = require('stream/consumers');
const logFile= path.join(__dirname,"../../astra_audit.log");

function write(level,msg,meta={}){
    const line = JSON.stringify({level,msg,meta , ts: new Date().toISOString()})
    fs.appendFileSync(logFile, line+"\n");
    console.log(`[${level.toUpperCase()}] ${msg}`);

}

module.exports={
    info:(msg,meta)=> write("info",msg,meta),
    warn:(msg,meta)=> write("info",msg,meta),
    error:(msg,meta)=> write("info",msg,meta),
};
