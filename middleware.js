const jwt = require("jsonwebtoken");
const SECRET_KEY = "pC5dGgrcYD5wjckJDa4yAVuBFYptWKFU";

function verifyToken(req, res, next) {
  const token = req.cookies["token"];

  if (!token) {
    return res.status(403).json({ message: "No token provided" });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) { 
      return res.status(401).json({ message: "Failed to authenticate token" });
    }

    // Save the decoded user information for use in other routes
    req.user = decoded;

    next();
  });
}

module.exports = verifyToken;
