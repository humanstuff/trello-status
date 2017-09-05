const key = process.env.TRELLO_API_KEY;
const token = process.env.TRELLO_API_TOKEN;
const https = require("https");

function getUrl(path, query) {
  query = "?" + (query || "");
  return "https://api.trello.com/1" + path + query + "&key=" + key + "&token=" + token;
}

function getObject(objectUrl) {
  return new Promise(function (resolve, reject) {
    if (!key || !token) return reject(new Error("Env variables missing: TRELLO_API_KEY, TRELLO_API_TOKEN"));
    
    var req = https.get(objectUrl, function (res) {
      var data = [];
      
      res.on('data', function (d) {
        data.push(d);
      });
      
      res.on('end', function () {
        try {
          var result = JSON.parse(data.join(""));
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
  var query = fields ? "fields=" + fields.join(",") : null;
  return getObject(getUrl("/cards/" + cardId + "/list", query));
}

function getCardById(cardId, fields) {
  var query = fields ? "fields=" + fields.join(",") : null;
  return getObject(getUrl("/cards/" + cardId, query)).then(card => {
    return getListByCardId(cardId, ["name"]).then(list => {
      card.listName = list.name;
      return card;
    });
  });
}

exports.getUrl = getUrl;
exports.getObject = getObject;
exports.getCardById = getCardById;
exports.getListByCardId = getListByCardId;
