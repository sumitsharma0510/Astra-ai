const openApp = require("./openApp");
const robot = require("robotjs");

module.exports = {
    open_app: (params)=> openApp(params.app_name),
    type_text: (params)=> robot.typeString(params.text),
    key_press: (params)=> robot.keyTap(params.key),
    none: async() => {},
};