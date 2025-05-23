const jwt = require('jsonwebtoken');

const pTokenResolveMiddleware = (req, res, next) => {
  try {
    const pToken = req.cookies?.[process.env.P_TOKEN]
    
    if (!pToken) {
      req.pUser = {};
      return next();
    }
    
    try {
      const decoded = jwt.decode(pToken);
      
      if (!decoded) {
        req.pUser = {};
        return next();
      }
      
      const {
        preferred_username,
        username,
      } = decoded;
      
      req.pUser = {
        username: preferred_username || username,
      };
      
    } catch (tokenError) {
      console.error('Error processing JWT token:', tokenError);
      req.pUser = {};
    }
  } catch (error) {
    console.error("Error in pTokenResolveMiddleware:", error);
    req.pUser = {};
  }

  next();
};

module.exports = pTokenResolveMiddleware; 