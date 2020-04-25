/*
if (process.env.NODE_ENV !== "production") {
  const result = require("dotenv").config({ path: "./api/variables.env" });
  if (result.error) {
    throw result.error;
  }
  console.log(result.parsed);
}
*/

const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const Datastore = require("nedb");
const authorizeSpotify = require("./authorizeSpotify");
const accessToken = require("./accessToken");
const spotifyData = require("./spotifyData");

const clientUrl = process.env.CLIENT_URL;
const app = express();
const db = new Datastore();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// tell node to use the client root directory
let clientRootDir = "";
if (process.env.NODE_ENV === "production") {
  clientRootDir = path.join(__dirname, "../client/build");
} else {
  clientRootDir = path.join(__dirname, "../client/public");
}
console.log("client root: " + clientRootDir);
//app.use(express.static(clientRootDir));

// test endpoint to see if the server is running
app.get("/ping", (req, res) => {
  res.send("It is ALIVE!!!");
});

// test endpoint to get the environment setting
app.get("/node-env", (req, res) => {
  res.send(`NODE_ENV: ${process.env.NODE_ENV}<br/>
            PORT: ${process.env.PORT}<br/>
            CLIENT_URL: ${process.env.CLIENT_URL}<br/>
            `);
});

app.get("/login", authorizeSpotify);

app.get("/callback", accessToken.getSpotifyAccessToken, (req, res, next) => {
  console.log("callback - credentials: " + JSON.stringify(req.credentials));
  db.insert(req.credentials, (err) => {
    if (err) {
      next(err);
    } else {
      res.redirect(`${clientUrl}/?authorized=true`);
    }
  });
});

app.get("/history", (req, res) => {
  accessToken.getAccessToken(db, (accessToken) => {
    const url = "https://api.spotify.com/v1/me/player/recently-played?limit=10";

    spotifyData
      .getSpotifyData(accessToken, url)
      .then((data) => {
        const arr = data.items.map((e) => ({
          played_at: e.played_at,
          track_name: e.track.name,
        }));
        res.json(arr);
      })
      .catch((err) => console.log(err));
  });
});

app.get("/playlists/:offset/:limit", (req, res) => {
  accessToken.getAccessToken(db, (accessToken) => {
    const url = `https://api.spotify.com/v1/me/playlists?offset=${req.params.offset}&limit=${req.params.limit}`;

    spotifyData
      .getSpotifyData(accessToken, url)
      .then((data) => {
        res.json(data);
      })
      .catch((err) => console.log(err));
  });
});

app.get("/playlist/:id", (req, res) => {
  accessToken.getAccessToken(db, (accessToken) => {
    const url = `https://api.spotify.com/v1/playlists/${req.params.id}`;

    spotifyData
      .getSpotifyData(accessToken, url)
      .then((data) => {
        res.json(data);
      })
      .catch((err) => console.log(err));
  });
});

app.get("/playlist-tracks/:id/:offset/:limit", (req, res) => {
  accessToken.getAccessToken(db, (accessToken) => {
    const url = `https://api.spotify.com/v1/playlists/${req.params.id}/tracks?offset=${req.params.offset}&limit=${req.params.limit}`;

    spotifyData
      .getSpotifyData(accessToken, url)
      .then((data) => {
        res.json(data);
      })
      .catch((err) => console.log(err));
  });
});

app.post("/queue-track/:uri", (req, res) => {
  accessToken.getAccessToken(db, (accessToken) => {
    console.log("queue track uri: " + req.params.uri);
    const url = `https://api.spotify.com/v1/me/player/queue?uri=${req.params.uri}`;

    spotifyData
      .postSpotifyData(accessToken, url)
      .then((data) => {
        console.log("queue track data: " + data);
        res.json(data);
      })
      .catch((err) => console.log(err));
  });
});

// serve up the react client to any unknown route
app.get("*", (req, res) => {
  res.sendfile(path.join(clientRootDir + "/index.html"));
});

app.set("port", process.env.PORT || 5000);
const server = app.listen(app.get("port"), () => {
  console.log(`Express running → PORT ${server.address().port}`);
});
