const crypto = require("crypto");

const tokenizeNickname = (nickname) => {
  const secretKey = "test";

  // Create a token using HMAC
  const token = crypto
    .createHmac("sha256", secretKey)
    .update(nickname)
    .digest("hex");

  return token;
};

module.exports = {
  tokenizeNickname,
};
