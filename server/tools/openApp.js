const {exec} = require("child_process");
const {isAppAllowed} = require("../security/permissions");
const { setDefaultAutoSelectFamily } = require("net");


function openApp(appName){
    return new Promise((resolve,reject)=>{
        if(!isAppAllowed(appName)) return reject(new Error (`App not permitted: ${appName}`));
        exec(`start ${appName}`,{shell:"cmd.exe"},(err)=>{
            if(err) return reject(err);
            setTimeout(resolve,800);
        });
    });
}

module.exports = openApp;
