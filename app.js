const express = require('express');
const cors = require('cors')
const graphqlHTTP = require('express-graphql');
const schema = require('./schema/schema')
const mongoose = require('mongoose')
const checkAuth = require('./utils/checkAuth')
const app = express();
const { ResponsePaginated } = require('./types/Response')
const { graphqlUploadExpress } = require('graphql-upload');


mongoose.connect(process.env.MONGO_INFO, {
    useUnifiedTopology: true,
    useNewUrlParser: true
})

app.use(cors())
app.use(checkAuth)
app.use('/graphql', graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }), graphqlHTTP({

    schema: schema,
    graphiql: true

}))


module.exports = app;