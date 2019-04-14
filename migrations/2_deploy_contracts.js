var ScriptGame = artifacts.require("./ScriptGame");

module.exports = function(deployer) {
  deployer.deploy(ScriptGame, "script", "script", 18, 1000);
};
