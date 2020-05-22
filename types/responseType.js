const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLNonNull,
    GraphQLInt

} = require('graphql')

const { userType, rentType, carType } = require('./types')

exports.ResponseType = new GraphQLObjectType({
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

exports.ResponsePaginateType = new GraphQLObjectType({
    name: 'responsepaginated',
    fields: () => ({
        status: { type: GraphQLNonNull(GraphQLInt) },
        message: { type: GraphQLNonNull(GraphQLString) },
        data: {
            type: new GraphQLObjectType({
                name: 'dataofpagination',
                fields: () => (
                    {
                        users: { type: GraphQLList(userType) },
                        cars: { type: GraphQLList(carType) },
                        rents: { type: GraphQLList(rentType) }
                    }
                )
            })
        },
        paginateddata: {
            type: new GraphQLObjectType({
                name: 'paginateddata',
                fields: () => (
                    {
                        pages: { type: GraphQLNonNull(GraphQLInt) },
                        total: { type: GraphQLNonNull(GraphQLInt) }
                    }
                )
            })
        }
    })
})
