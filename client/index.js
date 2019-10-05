const zeromq = require("zeromq"),
  socketPub = zeromq.socket("pub"),
  socketSub = zeromq.socket("sub"),
  { authorize } = require("../utils/util");

const pubPort = process.argv[2] || 3001;
const subPort = process.argv[3] || 8081;
const serverSubPort = 3000;

const initSockets = () => {
  socketPub.identity = pubPort + "" + process.pid;
  socketSub.identity = subPort + "" + process.pid;
  socketPub.bindSync(`tcp://127.0.0.1:${pubPort}`);
  socketSub.bindSync(`tcp://127.0.0.1:${subPort}`);
  socketSub.connect(`tcp://127.0.0.1:3000`);
  socketSub.subscribe("api_out");
};

socketSub.on("message", async function(buffer) {
  const msg = buffer.toString();
  const json = JSON.parse(msg.split(" ")[1]);
  console.log("JSON:", json);
  if (json[`status`] === `ok`) {
    console.log("ok");
    clearInterval(intervalHandler);
    authorize(json[`email`])
      .then(reply => socketPub.send(reply))
      .then(() => (intervalHandler = newInterval(4)));
  } else if (json[`status`] === `error`) {
    console.log("error");
  } else {
    console.log("other");
  }
});

const newInterval = seconds =>
  setInterval(function() {
    console.log("sending a multipart message envelope " + Date.now());
    socketPub.send(
      `api_in ` +
        JSON.stringify({
          type: "login",
          email: "mail@email3.com",
          pwd: "3fdsa",
          msg_id: "yyy"
        })
    );
  }, seconds * 1000);

initSockets();
var intervalHandler = newInterval(4);
