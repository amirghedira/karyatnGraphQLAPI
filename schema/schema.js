const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLBoolean,
    GraphQLList,
    GraphQLNonNull,
    GraphQLFloat,
    GraphQLInt,
    GraphQLInputObjectType,

} = require('graphql')


const resolvers = require('../resolvers/resolvers');
const { ResponseType, ResponsePaginateType } = require('../types/responseType');
const { logedUserType, userInfoType } = require('../types/types');

const rootQuery = new GraphQLObjectType({

    name: 'rootQuery',
    fields: () => ({
        allCars: {
            type: ResponsePaginateType,
            args: {
                page: { type: GraphQLNonNull(GraphQLString) },
                limit: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: resolvers.getallCars
        },
        car: {
            type: ResponseType,
            args: {
                _id: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: resolvers.getCar
        }
        ,
        allRentedCars: {
            type: ResponsePaginateType,
            args: {
                page: { type: GraphQLNonNull(GraphQLString) },
                limit: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: resolvers.getAllRentedCars
        },
        allFreeCars: {
            type: ResponsePaginateType,
            args: {
                page: { type: GraphQLNonNull(GraphQLString) },
                limit: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: resolvers.getAllFreeCars
        },
        cars: {
            type: ResponseType,
            resolve: resolvers.getCars
        },
        freeCars: {
            type: ResponseType,
            resolve: resolvers.getFreeCars
        },
        rentedCars: {
            type: ResponseType,
            resolve: resolvers.getRentedCars
        },
        carHistory: {
            type: ResponseType,
            args: {
                carid: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: resolvers.getCarHistory
        },
        activeRents: {
            type: ResponseType,
            resolve: resolvers.getActiveRents

        },
        unvalidatedRents: {
            type: ResponseType,
            resolve: resolvers.getUnvalidatedRents

        },
        reservations: {
            type: ResponseType,
            resolve: resolvers.getReservation
        },
        login: {
            type: logedUserType,
            args: {
                username: { type: GraphQLNonNull(GraphQLString) },
                password: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: resolvers.userLogin
        },
        user: {
            type: ResponseType,
            args: {
                _id: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: resolvers.getUser
        },
        activeUser: {
            type: ResponseType,
            resolve: resolvers.getActiveUser
        },
        managers: {
            type: ResponseType,
            args: {
                page: { type: GraphQLNonNull(GraphQLInt) },
                limit: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: resolvers.getManagers

        },
        userInformations: {
            type: userInfoType,
            resolve: resolvers.getUserInfo
        },
        archive: {
            type: ResponseType,
            resolve: resolvers.getArchive
        }

    })

})

const updateCarProps = new GraphQLInputObjectType({
    name: 'updateCarProps',
    fields: () => ({
        propName: { type: GraphQLNonNull(GraphQLString) },
        value: { type: GraphQLNonNull(GraphQLString) }
    })
})
const rootMutation = new GraphQLObjectType({

    name: 'rootMutation',
    fields: () => ({
        updateCar: {
            type: ResponseType,
            args: {
                _id: { type: GraphQLNonNull(GraphQLString) },
                fields: { type: GraphQLNonNull(GraphQLList(GraphQLNonNull(updateCarProps))) }

            },
            resolve: resolvers.updateCar
        },
        deleteCar: {
            type: ResponseType,
            args: {
                _id: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: resolvers.deleteCar
        },
        deleteReservation: {
            type: ResponseType,
            args: {
                _id: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: resolvers.deleteReservation
        },
        endRent: {
            type: ResponseType,
            args: {
                _id: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: (parent, args, req) => {
                if (req.isAuth) {

                    try {
                        resolvers.endRent(args._id)
                        res.status(200).json({ message: 'rent ended' })
                        return new Response(200, 'rent ended')
                    } catch (error) {
                        return new Response(500, error.message)
                    }
                }
                return new Response(401, 'Auth failed')

            }
        },
        sendRequest: {
            type: ResponseType,
            args: {
                ownerid: { type: GraphQLNonNull(GraphQLString) },
                carid: { type: GraphQLNonNull(GraphQLString) },
                totalprice: { type: GraphQLNonNull(GraphQLFloat) },
                fromdate: { type: GraphQLNonNull(GraphQLString) },
                todate: { type: GraphQLNonNull(GraphQLString) },
                subscribe: { type: GraphQLNonNull(GraphQLBoolean) }

            },
            resolve: resolvers.sendRequest
        },
        validateRequest: {
            type: ResponseType,
            args: {
                _id: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: resolvers.validateRequest
        },
        declinedRequest: {

            type: ResponseType,
            args: {

                _id: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: resolvers.declinedRequest
        },
    })
})


module.exports = new GraphQLSchema({
    query: rootQuery,
    mutation: rootMutation
})