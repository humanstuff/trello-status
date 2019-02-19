const key = process.env.TRELLO_API_KEY;
const token = process.env.TRELLO_API_TOKEN;
const throttle = process.env.TRELLO_THROTTLE || 100;
const https = require('https');
const qs = require('querystring');
const url = require('url');

function getObject(path, query, options) {
  var request = {
    protocol: 'https:',
    host: 'api.trello.com',
    pathname: '/1' + path,
    search: '?' + qs.stringify(Object.assign({}, { key, token, fields: ['all'] }, query))
  };

  return new Promise(function (resolve, reject) {
    if (!key || !token) return reject(new Error('Env variables missing: TRELLO_API_KEY, TRELLO_API_TOKEN'));

    setTimeout(function () {
      var requestUri = url.format(request);

      var req = https.get(requestUri, function (res) {
        var data = [];

        res.on('data', function (d) {
          data.push(d);
        });

        res.on('end', function () {
          try {
            var result = JSON.parse(data.join(''));
            resolve(result);
          } catch (e) {
            if (data) {
              console.log('data:', data.join(''));
            }
            else {
              console.log('error: no data');
            }

            reject(e);
          }
        });
      });

      req.on('error', function (e) {
        reject(e);
      });

      req.end();
    }, throttle);
  });
}

function getBoard(id, query) {
  var path;

  if (id.board) {
    path = `/boards/${id.board}`;
  }

  return getObject(path, query);
}

function getLists(id, query, filter) {
  var path;

  if (id.board) {
    path = `/boards/${id.board}/lists`;
  }

  if (filter) {
    path = `${path}/${filter}`;
  }

  return getObject(path, query);
}

function getList(id, query) {
  var path;

  if (id.list) {
    path = `/lists/${id.list}`;
  }
  else if (id.card) {
    path = `/cards/${id.card}/list`;
  }

  return getObject(path, query);
}

function getCards(id, query, filter) {
  var path;

  if (id.list) {
    path = `/lists/${id.list}/cards`;
  }
  else if (id.board) {
    path = `/board/${id.board}/cards`;
  }

  if (filter) {
    path = `${path}/${filter}`;
  }

  return getObject(path, query);
}

function getCard(id, query) {
  var path;

  if (id.card) {
    path = `/cards/${id.card}`;
  }

  return getObject(path, query);
}

function getMembers(id, query) {
  var path;

  if (id.card) {
    path = `/cards/${id.card}/members`;
  }

  return getObject(path, query);
}

exports.getObject = getObject;
exports.getBoard = getBoard;
exports.getLists = getLists;
exports.getList = getList;
exports.getCards = getCards;
exports.getCard = getCard;
exports.getMembers = getMembers;
