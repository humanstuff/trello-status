'use strict';

const express = require('express');
const PORT = 3000;
const HOST = '0.0.0.0';
const app = express();
const trello = require("./trello-api");

function getCardStatusAsImage(req, res) {
  res.send(`Generate status image for card ${req.params.cardId}`);
}

function getCardStatusAsText(req, res) {
  trello.getCardById(req.params.cardId)
  .then(card => {
    res.writeHead(200, { "content-type": "text/plain"});
    res.write(card.listName + "\n");
    res.write(card.labels.map(label => label.name).join(","));
    res.end();
  })
  .catch(err => {
    console.log(err);
    res.writeHead(500, { "content-type": "text/plain"});
    res.end("Server Error");
  });
}

app.get("/:cardId", getCardStatusAsText);
app.get("/:cardId/", getCardStatusAsText);
app.get("/:cardId/text", getCardStatusAsText);
app.get("/:cardId/text/", getCardStatusAsText);
app.get("/:cardId/image", getCardStatusAsImage);
app.get("/:cardId/image/", getCardStatusAsImage);

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
