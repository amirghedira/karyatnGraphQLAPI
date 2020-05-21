const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLNonNull,
    GraphQLInt

} = require('graphql')

const { userType, rentType, carType } = require('./types')

module.exports = new GraphQLObjectType({
    name: 'response',
    fields: () => ({
        status: { type: GraphQLNonNull(GraphQLInt) },
        message: { type: GraphQLNonNull(GraphQLString) },
        data: {
            type: new GraphQLObjectType({
                name: 'data',
                fields: () => (
                    {
                        users: { type: GraphQLList(userType) },
                        cars: { type: GraphQLList(carType) },
                        rents: { type: GraphQLList(rentType) }
                    }
                )
            })
        }
    })
})