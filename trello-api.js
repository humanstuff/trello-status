const key = process.env.TRELLO_API_KEY;
const token = process.env.TRELLO_API_TOKEN;
const https = require('https');
const qs = require('querystring');

function getUrl(path, query) {
  query = query || {};
  query.key = key;
  query.token = token;
  query = qs.stringify(query);
  
  return 'https://api.trello.com/1' + path + '?' + query;
}

function getObject(objectUrl) {
  return new Promise(function (resolve, reject) {
    if (!key || !token) return reject(new Error('Env variables missing: TRELLO_API_KEY, TRELLO_API_TOKEN'));
    
    var req = https.get(objectUrl, function (res) {
      var data = [];
      
      res.on('data', function (d) {
        data.push(d);
      });
      
      res.on('end', function () {
        try {
          var result = JSON.parse(data.join(''));
          resolve(result);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', function (e) {
      reject(e);
    });

    req.end();
  });
}

function getListByCardId(cardId, fields) {
  var query = {};
  
  if (fields) {
    query.fields = fields.join(',');
  }
  
  return getObject(getUrl('/cards/' + cardId + '/list', query));
}

function getCardById(cardId, fields) {
  var query = {};
  
  if (fields) {
    query.fields = fields.join(',');
  }
  
  return getObject(getUrl('/cards/' + cardId, query)).then(card => {
    return getListByCardId(cardId, ['name']).then(list => {
      card.listName = list.name;
      return card;
    });
  });
}

exports.getUrl = getUrl;
exports.getObject = getObject;
exports.getCardById = getCardById;
exports.getListByCardId = getListByCardId;
