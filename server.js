'use strict';

const express = require('express');
const PORT = 3000;
const HOST = '0.0.0.0';
const app = express();
const trello = require('./trello-api');
const imageTemplate = '<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" height="50px" width="150px" viewBox="0 0 150 29.8838"><title>Item Status</title><text transform="translate(14.8265 12.0209)" style="font-size:14px;font-family:Helvetica, Helvetica">{{primary-status}}</text><text transform="translate(14.8265 24.1124)" style="font-size:12px;font-family:Helvetica, Helvetica">{{secondary-status}}</text></svg>';

function getCardStatus(cardId) {
  return trello.getCardById(cardId).then(card => {
    var status = {};
    status.primary = card.listName;
    status.secondary = card.labels.map(label => label.name).join(',');
    return status;
  });
}

function getCardStatusAsImage(req, res) {
  getCardStatus(req.params.cardId).then(status => {
    res.writeHead(200, { 'content-type': 'image/svg+xml', 'cache-control': 'no-cache, no-store' });
    var imageContent = imageTemplate.replace("{{primary-status}}", status.primary).replace("{{secondary-status}}", status.secondary);
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

app.get('/:cardId', getCardStatusAsText);
app.get('/:cardId/', getCardStatusAsText);
app.get('/:cardId/text', getCardStatusAsText);
app.get('/:cardId/text/', getCardStatusAsText);
app.get('/:cardId/image', getCardStatusAsImage);
app.get('/:cardId/image/', getCardStatusAsImage);

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
