const zeromq = require("zeromq"),
  socketPub = zeromq.socket("pub"),
  socketSub = zeromq.socket("sub"),
  { initDb, getUser } = require("../db/db_manger"),
  { generateMsg, passwordsMatch } = require("../utils/util");

const pubPort = process.argv[2] || 3000;
const subPort = process.argv[3] || 8080;
const clientPubPort = 3001;

const initSockets = () => {
  socketPub.identity = pubPort + "" + process.pid;
  socketSub.identity = subPort + "" + process.pid;
  socketPub.bindSync(`tcp://127.0.0.1:${pubPort}`);
  socketSub.bindSync(`tcp://127.0.0.1:${subPort}`);
  socketSub.connect(`tcp://127.0.0.1:${clientPubPort}`);
  socketSub.subscribe("api_in");
};

socketSub.on("message", async function(buffer) {
  const msg = buffer.toString();
  const json = JSON.parse(msg.split(" ")[1]);
  console.log("In JSON: ", json);

  if (json[`type`] === `login`) {
    const userFromDb = await getUser(json.email);

    if (userFromDb && passwordsMatch(userFromDb.pwd, json.pwd)) {
      socketPub.send(
        `api_out ` + generateMsg(json.msg_id, "ok", userFromDb.user_id)
      );
    } else {
      socketPub.send(`api_out ` + generateMsg("yyy", "error", "WRONG_PWD"));
    }
  } else {
    socketPub.send(`api_out ` + generateMsg("yyy", "error", "WRONG_FORMAT"));
  }
});

// initDb();
initSockets();
