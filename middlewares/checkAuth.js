const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    req.isAuth = false;
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZWJjOTRkZWNmZTQyNzAwMTdmMWJjMzQiLCJ1c2VybmFtZSI6ImxhemVyIiwiZW1haWwiOiJraGFtbWVzc2lhemVyQGdtYWlsLmNvbSIsImlhdCI6MTU4OTk0OTA3NX0.TeOIMndZjJt9ZAETOTvlxK1iXvdy9h_auuy9hEzx8pc";
    if (!token || token === '')
        return next()

    try {
        const decodedtoken = jwt.verify(token, process.env.JWT_SECRET_KEY)
        req.isAuth = true;
        req.user = decodedtoken;
        next()
    } catch (error) {
        return next()
    }
}