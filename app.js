const express = require('express');
const graphqlHTTP = require('express-graphql');
const schema = require('./schema/schema')
const mongoose = require('mongoose')
const checkAuth = require('./utils/checkAuth')
const app = express();

mongoose.connect(process.env.MONGO_INFO, {
    useUnifiedTopology: true,
    useNewUrlParser: true
})

app.use(checkAuth)
app.use('/graphql', graphqlHTTP({
    graphiql: true,
    schema: schema

}))


module.exports = app;