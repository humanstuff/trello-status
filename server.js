'use strict';

const express = require('express');
const PORT = 3000;
const HOST = '0.0.0.0';
const app = express();
const trello = require('./trello-api');
const imageTemplate = '<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" height="50px" width="150px" viewBox="0 0 150 29.8838"><title>Item Status</title><text transform="translate(14.8265 12.0209)" style="font-size:14px;font-family:Helvetica, Helvetica">{{primary-status}}</text><text transform="translate(14.8265 24.1124)" style="font-size:12px;font-family:Helvetica, Helvetica">{{secondary-status}}</text></svg>';

function getCardStatus(cardId) {
  return trello.getList({ card:cardId }, { fields: ['name' ] }).then(list => {
    return trello.getCard({ card: cardId }, { fields: [ 'labels' ] }).then(card => {
      return {
        primary: list.name,
        secondary: card.labels.map(label => label.name).join(',')
      };
    });
  });
}

function getCardStatusAsImage(req, res) {
  getCardStatus(req.params.cardId).then(status => {
    res.writeHead(200, { 'content-type': 'image/svg+xml', 'cache-control': 'no-cache, no-store' });

    var height = +req.query.h || 48;
    var width = +req.query.w || 192;
    var backgroundColor = req.query.bg || "#003b64";
    var color = req.query.fg || "#ffffff";
    var text = status.primary;

    var imageContent = `<svg xmlns="http://www.w3.org/2000/svg" height="${height}" width="${width}">
      <style>
        svg {
          background-color: ${backgroundColor};
        }
        #statusText {
          font-family: Roboto, Helvetica, sans-serif;
          font-size: 12px;
          font-weight: bold;
          line-height: 1.4;
          text-anchor: middle;
        }
      </style>
      <text id="statusText" x="0" y="0" fill="${color}" transform="translate(${width/2} ${(height + 8.4)/2})">
        <![CDATA[
          ${text}
        ]]>
      </text>
    </svg>
    `;

    res.write(imageContent);
    res.end();
  })
  .catch(err => {
    console.log(err);
    res.writeHead(500, { 'content-type': 'image/svg+xml' });
    var imageContent = imageTemplate.replace("{{primary-status}}", "Unknown").replace("{{secondary-status}}", "server error");
    res.write(imageContent);
    res.end();
  });
}

function getCardStatusAsText(req, res) {
  getCardStatus(req.params.cardId).then(status => {
    res.writeHead(200, { 'content-type': 'text/plain', 'cache-control': 'no-cache, no-store' });
    res.write(status.primary + '\n' + status.secondary);
    res.end();
  })
  .catch(err => {
    console.log(err);
    res.writeHead(500, { 'content-type': 'text/plain' });
    res.end('Server Error');
  });
}

function getListSummary(list) {
  return trello.getCards({ list: list.id })
    .then(cards => {
      return {
        name: list.name,
        cards: cards.length
      };
    });
}

function getBoardSummary(req, res) {
  trello.getLists({ board: req.params.boardId }).then(lists => {
    return Promise.all(lists.map(getListSummary));
  })
  .then(summaries => {
    res.writeHead(200, { 'content-type': 'text/plain', 'cache-control': 'no-cache, no-store' });
    summaries.forEach(summary => {
      res.write(summary.name + ': ' + summary.cards + '\n');
    });
    res.end();
  })
  .catch(err => {
    console.log(err);
    res.writeHead(500, { 'content-type': 'text/plain' });
    res.end('Server Error');
  });
}

app.get('/cards/:cardId', getCardStatusAsText);
app.get('/cards/:cardId/', getCardStatusAsText);
app.get('/cards/:cardId/text', getCardStatusAsText);
app.get('/cards/:cardId/text/', getCardStatusAsText);
app.get('/cards/:cardId/image', getCardStatusAsImage);
app.get('/cards/:cardId/image/', getCardStatusAsImage);
app.get('/boards/:boardId/summary', getBoardSummary);
app.get('/boards/:boardId/summary/', getBoardSummary);

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
