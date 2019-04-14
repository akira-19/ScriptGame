
App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    return await App.initWeb3();
  },

  initWeb3: async function() {
      // Modern dapp browsers...
  if (window.ethereum) {
    App.web3Provider = window.ethereum;
    try {
      // Request account access
      await window.ethereum.enable();
    } catch (error) {
      // User denied account access...
      console.error("User denied account access")
    }
  }
  // Legacy dapp browsers...
  else if (window.web3) {
    App.web3Provider = window.web3.currentProvider;
  }
  // If no injected web3 instance is detected, fall back to Ganache
  else {
    App.web3Provider = new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/0dca15c1e9fd4ea3a900a7f3bfb33e73');
  }
  web3 = new Web3(App.web3Provider);
  return App.initContract();
  },

  initContract: function() {
      $.getJSON('ScriptGame.json', function(data) {
    // Get the necessary contract artifact file and instantiate it with truffle-contract
    var ScriptGameArtifact = data;
    App.contracts.ScriptGame = TruffleContract(ScriptGameArtifact);
    // Set the provider for our contract
    App.contracts.ScriptGame.setProvider(App.web3Provider);

    // show questions
    return App.showQuestion();
  });
  },

showQuestion: function(){
    $.getJSON('js/questions.json', function(data){
        App.contracts.ScriptGame.deployed().then(instance => {
            return instance.getScriptAmount();
        }).then(amount => {
            if(parseInt(amount) == 5){
                $("#playgame").html("<div id='certificate'><h3>Congratuation!!</h3><p>You have passed all questions. Now you are a Script Expert!</p></div>");
            }else{
              let questionNum;
              switch (parseInt(amount)) {
                  case 0:
                      questionNum = 0;
                      break;
                  case 1:
                      questionNum = 1;
                      break;
                  case 2:
                      questionNum = 2;
                      break;
                  case 3:
                      questionNum = 3;
                      break;
                  case 4:
                      questionNum = 4;
                      break;
                  default:

              }
              let question = data.questions[questionNum].question;
              let answerArray = data.questions[questionNum].answer.split(' ');

              let titleArray = ["Newbie Question", "Begginer Question", "Intermediate Question", "Advanced Question", "Expert Question"];

              for (var i = answerArray.length - 1; i >= 0; i--){
                  var rand = Math.floor( Math.random() * ( i + 1 ) );
                  [answerArray[i], answerArray[rand]] = [answerArray[rand], answerArray[i]]

              }

              $("#question").append(titleArray[questionNum]+"<br>");
              $("#question").append(question);

              for (var i = 0; i < answerArray.length; i++) {
                  let escapedAnswer = App.escapeStr(answerArray[i]);
                  $('#questionsChoices').append("<div draggable='true' ondragstart='App.dragStart(event)' class='answerChoice' id='choice-" + i + "'>" + escapedAnswer + "</div>")
              }
          }
        }).catch(function(err) {
            console.log(err.message)
        });

    });
},

dragStart: function(event){
    event.dataTransfer.setData("text", event.target.id);
},

dragOver: function(event){
    event.preventDefault();
},

dropDiv: function(event){
    let id = event.dataTransfer.getData("text");

    let draggedElm = document.getElementById(id);

    event.currentTarget.appendChild(draggedElm);

    event.preventDefault();
},

checkAnswer: function(){
    $.getJSON('js/questions.json', function(data){
        App.contracts.ScriptGame.deployed().then(instance => {
            return instance.getScriptAmount();
        }).then(amount => {
            let questionNum = parseInt(amount);
            // get the answer without space
            let answer = data.questions[questionNum].answer;
            answer = answer.replace(/\s+/g, "");

            // get user answer
            let userAnswer = $("#answers").children().text();

            console.log(answer);
            console.log(userAnswer);

            if (answer == userAnswer){
                App.contracts.ScriptGame.deployed().then(instance => {
                    return instance.giveScript();
                }).catch(function(err) {
                    console.log(err.message)
                });
            }
        });

    });
},

escapeStr: function(string){
    if(typeof string !== 'string') {
   return string;
 }
 return string.replace(/[&'`"<>]/g, function(match) {
   return {
     '&': '&amp;',
     "'": '&#x27;',
     '`': '&#x60;',
     '"': '&quot;',
     '<': '&lt;',
     '>': '&gt;',
   }[match]
 });
}
};

$(function() {
  $(window).load(function() {

    App.init();
  });
});
