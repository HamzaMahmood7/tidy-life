const jwt = require("jsonwebtoken");

function isAuthenticated(req, res, next) {
  // checks if in the request there is a header called authorisation and the first word is 'Bearer' and there is a second word
  if (
    req.headers.authorisation.split(" ")[0] === "Bearer" &&
    req.headers.authorisation.split(" ")[1]
  ) {
    const theTokenInHeaders = req.headers.authorisation.split(" ")[1];
    console.log(
      "there is an authorisation in the headers and Bearer is the first word",
      theTokenInHeaders,
    );
    try {
      const decodedToken = jwt.verify(
        theTokenInHeaders,
        process.env.TOKEN_SECRET,
      );
      req.payload = decodedToken;
      next();
    } catch (error) {
      res.status(403).json({ errorMessage: "Invalid Token" });
    }
  } else {
    res.status(403).json({ errorMessage: "Headers malformed" });
  }
}

module.exports = { isAuthenticated };
