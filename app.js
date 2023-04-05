const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("db server started http://localhost3000/");
    });
  } catch (e) {
    console.log(`Db error: ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//GET PLAYERS API
app.get("/players/", async (request, response) => {
  try {
    const getPlayersQuery = `SELECT * FROM cricket_team ORDER BY player_id`;
    const playersArray = await db.all(getPlayersQuery);
    response.send(
      playersArray.map((eachPlayer) =>
        convertDbObjectToResponseObject(eachPlayer)
      )
    );
  } catch (e) {
    console.log(`Db Error: ${e.message}`);
  }
});

//CRATE A PLAYER API

app.post("/players/", async (request, response) => {
  try {
    const { playerName, jerseyNumber, role } = request.body;
    const addPlayerQuery = `INSERT INTO
   cricket_team (player_name,jersey_number,role)
    VALUES
      (
        '${playerName}',
         ${jerseyNumber},
         '${role}'
      );`;
    await db.run(addPlayerQuery);
    response.send("Player Added to Team");
  } catch (e) {
    console.log(`Db Error: ${e.message}`);
  }
});

//Returns a player based on a player ID API
app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerIdQuery = `SELECT * FROM cricket_team WHERE player_id = ${playerId}`;
  const playerResponse = await db.get(getPlayerIdQuery);
  response.send(convertDbObjectToResponseObject(playerResponse));
});

//UpDate Player Details API
app.put("/players/:playerId/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const { playerId } = request.params;
  const updatePlayerQuery = `
  UPDATE
    cricket_team
  SET
    player_name = '${playerName}',
    jersey_number = ${jerseyNumber},
    role = '${role}'
  WHERE
    player_id = ${playerId};`;

  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//DELETE Player Details API
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
  DELETE FROM
    cricket_team
  WHERE
    player_id = ${playerId};`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});
