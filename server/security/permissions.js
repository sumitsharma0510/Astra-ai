const permission =  require('./permissions.json');

function isAppAllowed(appName){
    return permissions.apps.allowed.includes(appName.toLowerCase());
}

function isActionForbidden(action){
    return permissions.forbidden_actions.includes(action);
}

module.exports ={
    isAppAllowed,
    isActionForbidden
}
