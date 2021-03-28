const cron = require("node-cron");
var AWS = require("aws-sdk");
const { connect, getCursor, setStandardAndPoors } = require("./dbController");
AWS.config.region = "us-east-1";
var lambda = new AWS.Lambda();

function updateStandardStock(client) {
  try {
    payload = {
      updateStandardStock: true,
    };

    // TODO: figure out if I should get rid of RequestReponse.
    var params = {
      FunctionName: "run-code",
      Payload: JSON.stringify(payload),
      InvocationType: "RequestResponse",
    };
    lambda.invoke(params, function (err, data) {
      if (err) {
        console.log(err);
      } else {
        console.log(data.Payload);
        setStandardAndPoors(
          client,
          JSON.parse(data.Payload)["standardAndPoors100d"]
        );
      }
    });
  } catch (e) {
      console.log(e);
  }
}

function executeLambdas(client) {
  cron.schedule(
    "00 33 15 * * *",
    async () => {
      // Run cron job everyday at 4:30 EST.
      updateStandardStock(client);
      const cursor = await getCursor(client);
      await cursor.forEach(async (doc) => {
        console.log(doc);
        for (const submission in doc["submissions"]) {
          vals = doc["submissions"][submission];
          payload = {
            code: vals["code"],
            cash: vals["cash"],
            stocks: vals["stocks"],
          };
          var params = {
            FunctionName: "run-code",
            Payload: JSON.stringify(payload),
            InvocationType: "RequestResponse",
          };
          lambda.invoke(params, function (err, data) {
            if (err) {
              console.log(err);
            } else {
              console.log(data.Payload);
            }
          });
        }
      });
    },
    {
      scheduled: true,
      timezone: "America/New_York",
    }
  );
}

module.exports = { executeLambdas };
