const express = require("express");
const path = require("path");

const isDev = process.env.NODE_ENV !== "production";
const PORT = process.env.PORT || 5000;

const app = express();

// Priority serve any static files.
app.use(express.static(path.resolve(__dirname, "../client/build")));

// test endpoint to see if the server is running
app.get("/ping", (req, res) => {
  res.send("It is ALIVE!!!");
});

// Answer API requests.
app.get("/api", function (req, res) {
  console.log("got a hit");
  res.set("Content-Type", "application/json");
  res.send('{"message":"Hello from the custom server!"}');
});

// All remaining requests return the React app, so it can handle routing.
app.get("*", function (request, response) {
  if (isDev) {
    response.sendFile(
      path.resolve(__dirname, "../client/public", "index.html")
    );
  } else {
    response.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
  }
});

app.listen(PORT, function () {
  console.error(
    `Node ${
      isDev ? "dev server" : "cluster worker " + process.pid
    }: listening on port ${PORT}`
  );
});
