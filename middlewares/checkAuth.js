const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    req.isAuth = false;
    const token = req.headers.authorization;
    if (!token || token === '')
        return next()

    try {
        const decodedtoken = jwt.verify(token, process.env.JWT_SECRET_KEY)
    } catch (error) {
        return next()
    }
    if (!decodedtoken)
        return next()

    req.isAuth = true;
    req.user = decodedtoken;
}