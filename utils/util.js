const readline = require("readline");

const generateMsg = (msg_id, status, user_idOrError) => {
  console.log("Generating message: ", status);

  if (status == "ok") {
    return JSON.stringify({
      msg_id,
      user_id: user_idOrError,
      status
    });
  } else {
    return JSON.stringify({
      msg_id,
      status,
      error: user_idOrError
    });
  }
};

const passwordsMatch = (pwd1, pwd2) => pwd1 == pwd2;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const authorize = async email => {
  console.log("Now it's time to authorize... \n\r");

  var login = await new Promise((res, rej) => {
    rl.question("Login...\n\r", login => {
      res(login);
    });
  });

  var pwd = await new Promise((res, rej) => {
    rl.question("Password...\n\r", password => {
      rl.close();
      res(password);
    });
  });

  const msg_id = [...Array(8)]
    .map(() => (~~(Math.random() * 36)).toString(36))
    .join("");
  const msg = `api_in ` + JSON.stringify({ type: `login`, pwd, email, msg_id });
  console.log("Sending to server: ", msg);
  return msg;
};

module.exports = {
  generateMsg,
  passwordsMatch,
  authorize
};
