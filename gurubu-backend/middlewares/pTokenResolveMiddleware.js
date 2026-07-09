const pTokenResolveMiddleware = (req, res, next) => {
  req.pUser = {};

  next();
};

module.exports = pTokenResolveMiddleware;
