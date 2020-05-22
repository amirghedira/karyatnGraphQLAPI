const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    req.isAuth = false;
    // const token = req.headers.authorization
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZWJjOTRkZWNmZTQyNzAwMTdmMWJjMzQiLCJ1c2VybmFtZSI6ImxhemVyIiwiZW1haWwiOiJraGFtbWVzc2lhemVyQGdtYWlsLmNvbSIsImlhdCI6MTU5MDE4NDUzNX0.8d_31Q3cc_ZRl54Abkz6vcjYmFBK6xWpQWzxC1JCCo8"
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