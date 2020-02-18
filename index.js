// Your web app's Firebase configuration

var firebaseConfig = {
  apiKey: "AIzaSyBF_IJckknW2Rg6ww6ITW7gNgavENU7gO0",
  authDomain: "rockpaperscissors-b3c08.firebaseapp.com",
  databaseURL: "https://rockpaperscissors-b3c08.firebaseio.com",
  projectId: "rockpaperscissors-b3c08",
  storageBucket: "rockpaperscissors-b3c08.appspot.com",
  messagingSenderId: "31174299410",
  appId: "1:31174299410:web:68ff4076cfaadc8c87adcb"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

//Andy's ID Trick
var myid = "";
if (localStorage) {
  if (!localStorage.getItem("sillyID")) {
    myid = "id" + Math.floor(Math.random() * 500000000);
    localStorage.setItem("sillyID", myid);
  } else {
    myid = localStorage.getItem("sillyID");
  }
}

let userNameCheck = function(userName) {
  let isEmpty = userName.trim().length === 0 ? true : false;
  if (isEmpty) {
    userName = "GuestUser" + Math.floor(Math.random() * 9999) + " " + myid;
  } else {
    userName += " " + myid;
  }
  return userName;
};

//Two Views, view1 one will be LOBBY, view2 will be game.
// "Single page app architecture" rerenders main screens

let clickHandler = function(evt) {
  let gameId = $(evt.currentTarget).attr("data-gameId");
  let userName = $("#userName").val();
  document.getElementById('lobbyscreen').style.display='none';
  displayGame(gameId, userNameCheck(userName));
};

//World 1: Lobby
let displayLobby = function() {
  $("#mainscreen").html($("#myTemplate").html());
  firebase
    .database()
    .ref("lobby")
    .on("value", ss => {
      let gamesObj = ss.val();
      let gameIds = Object.keys(gamesObj);
      $("#theGames").html("");
      gameIds.map(gameId => {
        $("#theGames").append(`<li>
<a class = "showGame" data-gameid=${gameId}>
${gamesObj[gameId].title}</a>
</li>`);
      });

      $(".showGame").off("click", clickHandler);
      $(".showGame").on("click", clickHandler);
      //alert(JSON.stringify(ss.val()));
    });

  $("#createGame").on("click", function() {
    let newGameRef = firebase
      .database()
      .ref("lobby")
      .push();
    newGameRef.set({ title: $("#gameName").val() });

    newGameRef
      .child("player1")
      .child("choice")
      .set("none");
    newGameRef
      .child("player1")
      .child("score")
      .set(0);
    newGameRef
      .child("player1")
      .child("playerid")
      .set(0);
    newGameRef
      .child("player1")
      .child("playername")
      .set("Player 1");

    newGameRef
      .child("player2")
      .child("choice")
      .set("none");
    newGameRef
      .child("player2")
      .child("score")
      .set(0);
    newGameRef
      .child("player2")
      .child("playerid")
      .set(0);
    newGameRef
      .child("player2")
      .child("playername")
      .set("Player 2");
  });
};

// addUsers grants gameUsers(data.users) a child with myid as an id.
let addUsers = function(gameId, myid, userName) {
  firebase
    .database()
    .ref("lobby")
    .child(gameId)
    .child("users")
    .child(myid)
    .set(userName);
};

//World 2: Game
let displayGame = function(gameId, userName) {
  let gameRef = firebase.database().ref(`/lobby/${gameId}/`);
  gameRef.on("value", ss => {
    let gameData = ss.val();
    let gameTitle = gameData.title;
    let gameUsers = gameData.users || [];
    let player1 = gameData.player1;
    let player2 = gameData.player2;
    let amntUsers = Object.keys(gameUsers).length;

    let playerChoice = {
      p1Choice: player1.choice,
      p2Choice: player2.choice
    };

    let playerScore = {
      p1Score: player1.score,
      p2Score: player2.score
    };

    let playerKey = {
      //plKey: gameUsers[0].getKey();
    };

    $("#mainscreen").html(`
<h1>Welcome to ${gameTitle} </h1>
<h3>Instructions:</h3>
1. Select a move, you can change it as long as your opponent hasn't selected. <br>
2. When both players have chosen the round will start!<br>
3. Don't be afraid to re-pick your choice so that the database properly updates! <br>
4. Feel free to change your username anytime! Sometimes the database doesn't update in time, the next screen refresh will fix it!<br>
5. Enjoy. :)<br>
<br>

<b>
${player1.playername} Score: ${player1.score}<br>
 ${player2.playername} Score: ${player2.score}<br>
</br>
<br>
<b><u>Users in Game:</b></u>
<ol id = "users"></ol>

<button class = "bRock"> Rock <i class="far fa-hand-rock"></i></button>
<button class = "bPaper"> Paper <i class="far fa-hand-paper"></i></button>
<button class = "bScissors"> Scissors <i class="far fa-hand-scissors"></i></button>
<br><br>
<b><u>Current Choice:</b></u>
  <ul id = "currentChoice">
No Current Choice
    </ul>
<input id= "changeUser" placeholder = "Change Username"/>
<button class = "changeName">Update</button>
<br><br>
<button class = "backButton"> Back to Lobby</button>
`);

    //console.log(amntUsers);

    if (amntUsers < 1) {
      addUsers(gameId, myid, userName);
      firebase
        .database()
        .ref("lobby")
        .child(gameId)
        .child("player1")
        .child("playerid")
        .set(myid);
      firebase
        .database()
        .ref("lobby")
        .child(gameId)
        .child("player1")
        .child("playername")
        .set(userName);

      firebase
        .database()
        .ref("lobby")
        .child(gameId)
        .child("player2")
        .child("playerid")
        .set(0);
      firebase
        .database()
        .ref("lobby")
        .child(gameId)
        .child("player2")
        .child("playername")
        .set("Player 2");
    } else if (amntUsers < 2 && myid !== player1.playerid) {
      addUsers(gameId, myid, userName);

      firebase
        .database()
        .ref("lobby")
        .child(gameId)
        .child("player2")
        .child("playerid")
        .set(myid);
      firebase
        .database()
        .ref("lobby")
        .child(gameId)
        .child("player2")
        .child("playername")
        .set(userName);
    } else if (myid !== player2.playerid && myid !== player1.playerid) {
      addUsers(gameId, myid, userName);
    }

    $("#users").html("");
    Object.keys(gameUsers).map(user => {
      $("#users").append(`<li>${gameUsers[user]}</li>`);
    });

    // Checks if both players have chosen.
    let choiceCheck = function() {
      //console.log("Calls choiceCheck");
      //console.log(playerChoice.p1Choice);
      //console.log(playerChoice.p2Choice);

      if (playerChoice.p1Choice != "none" && playerChoice.p2Choice != "none") {
        alert("Both players haven chosen.");
        scoreUpdate(
          compareChoice(playerChoice.p1Choice, playerChoice.p2Choice)
        );
      }
    };

    // Game Comparitor: Compares both choices and returns a number.
    let compareChoice = function(choice1, choice2) {
      //alert("Choice Comparitor Started.")
      let winningUser;

      if (choice1 == "scissors" && choice2 == "scissors") {
        winningUser = 0;
      } else if (choice1 == "rock" && choice2 == "rock") {
        winningUser = 0;
      } else if (choice1 == "paper" && choice2 == "paper") {
        winningUser = 0;
      } else if (choice1 == "scissors" && choice2 == "paper") {
        winningUser = 1;
      } else if (choice1 == "paper" && choice2 == "rock") {
        winningUser = 1;
      } else if (choice1 == "rock" && choice2 == "scissors") {
        winningUser = 1;
      } else if (choice1 == "paper" && choice2 == "scissors") {
        winningUser = 2;
      } else if (choice1 == "scissors" && choice2 == "rock") {
        winningUser = 2;
      } else if (choice1 == "rock" && choice2 == "paper") {
        winningUser = 2;
      }

      return winningUser;
    };

    // Score Updater: Grabs a number (from compareChoice) and updates score depending on user who wins.
    // Resets choices to "none".
    let scoreUpdate = function(winningUser) {
      let score;

      if (winningUser == 0) {
        alert("No one wins this round.");
      } else if (winningUser == 1) {
        //Update player 1 score
        score = playerScore.p1Score + 1;
        console.log(score);
        firebase
          .database()
          .ref("lobby")
          .child(gameId)
          .child("player1")
          .child("score")
          .set(score);
        alert("Player 1 wins this round.");
      } else if (winningUser == 2) {
        //Update player 2 score
        score = playerScore.p2Score + 1;
        firebase
          .database()
          .ref("lobby")
          .child(gameId)
          .child("player2")
          .child("score")
          .set(score);
        alert("Player 2 wins this round.");
      }
      //Resets choices.
      firebase
        .database()
        .ref("lobby")
        .child(gameId)
        .child("player1")
        .child("choice")
        .set("none");
      firebase
        .database()
        .ref("lobby")
        .child(gameId)
        .child("player2")
        .child("choice")
        .set("none");
      //alert("Player 1 Score: " +  + "Player 2 Score:" )
    };

    //Player 1 Button promps.
    if (myid == player1.playerid) {
      $(".bRock").on("click", function() {
        alert("Selected Rock!");
        firebase
          .database()
          .ref("lobby")
          .child(gameId)
          .child("player1")
          .child("choice")
          .set("rock");
        choiceCheck();
      });

      $(".bPaper").on("click", function() {
        alert("Selected Paper!");
        firebase
          .database()
          .ref("lobby")
          .child(gameId)
          .child("player1")
          .child("choice")
          .set("paper");
        choiceCheck();
      });

      $(".bScissors").on("click", function() {
        alert("Selected Scissors!");
        firebase
          .database()
          .ref("lobby")
          .child(gameId)
          .child("player1")
          .child("choice")
          .set("scissors");
        choiceCheck();
      });
      $("#currentChoice").html("");
      Object.keys(player1.choice).map(choice => {
        $("#currentChoice").append(`${player1.choice[choice]}`);
      });
    }

    // Player 2 button promps
    if (myid == player2.playerid) {
      $(".bRock").on("click", function() {
        alert("Selected Rock!");
        firebase
          .database()
          .ref("lobby")
          .child(gameId)
          .child("player2")
          .child("choice")
          .set("rock");
        choiceCheck();
      });

      $(".bPaper").on("click", function() {
        alert("Selected Paper!");
        firebase
          .database()
          .ref("lobby")
          .child(gameId)
          .child("player2")
          .child("choice")
          .set("paper");
        choiceCheck();
      });

      $(".bScissors").on("click", function() {
        alert("Selected Scissors!");
        firebase
          .database()
          .ref("lobby")
          .child(gameId)
          .child("player2")
          .child("choice")
          .set("scissors");
        choiceCheck();
      });
      $("#currentChoice").html("");
      Object.keys(player2.choice).map(choice => {
        $("#currentChoice").append(`${player2.choice[choice]}`);
      });
    }

    let changeUser = function() {
      userName = userNameCheck($("#changeUser").val());
      firebase
        .database()
        .ref("lobby")
        .child(gameId)
        .child("users")
        .child(myid)
        .set(userName);

      if (myid == player1.playerid) {
        firebase
          .database()
          .ref("lobby")
          .child(gameId)
          .child("player1")
          .child("playername")
          .set(userName);
      }

      if (myid == player2.playerid) {
        firebase
          .database()
          .ref("lobby")
          .child(gameId)
          .child("player2")
          .child("playername")
          .set(userName);
      }
    };

    $(".changeName").on("click", changeUser);
    $(".backButton").on("click", displayLobby);
    //End of gameRef ss=>
  });
  // End of displayGame()
};

displayLobby();
//displayGame("Test Game");
