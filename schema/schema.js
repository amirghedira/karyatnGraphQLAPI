const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLBoolean,
    GraphQLList,
    GraphQLNonNull,
    GraphQLFloat,
    GraphQLInt

} = require('graphql')

const User = require('../models/User')
const Rent = require('../models/Rent')
const Car = require('../models/Car')

const notificationType = new GraphQLObjectType({
    name: 'notification',
    fields: () => ({
        _id: { type: GraphQLNonNull(GraphQLString) },
        userid: { type: GraphQLNonNull(userType) },
        carid: { type: GraphQLNonNull(carType) },
        type: { type: GraphQLNonNull(GraphQLString) },
        read: { type: GraphQLNonNull(GraphQLBoolean) },
        date: { type: GraphQLNonNull(GraphQLString) }
    })
})

const rentType = new GraphQLObjectType({
    name: 'rent',
    fields: () => ({

        _id: { type: GraphQLNonNull(GraphQLString) },
        carid: { type: GraphQLNonNull(carType) },
        clientid: { type: GraphQLNonNull(userType) },
        ownerid: { type: GraphQLNonNull(userType) },
        totalprice: { type: GraphQLNonNull(GraphQLFloat) },
        from: { type: GraphQLNonNull(GraphQLString) },
        to: { type: GraphQLNonNull(GraphQLString) },
        daterent: { type: GraphQLNonNull(GraphQLString) },
        validated: { type: GraphQLNonNull(GraphQLBoolean) },
        active: { type: GraphQLNonNull(GraphQLBoolean) },
        ended: { type: GraphQLNonNull(GraphQLBoolean) }
    })
})

const carType = new GraphQLObjectType({
    name: 'car',
    fields: () => ({
        _id: { type: GraphQLNonNull(GraphQLString) },
        carnumber: { type: GraphQLNonNull(GraphQLString) },
        brand: { type: GraphQLNonNull(GraphQLString) },
        color: { type: GraphQLNonNull(GraphQLString) },
        price: { type: GraphQLNonNull(GraphQLFloat) },
        transmission: { type: GraphQLNonNull(GraphQLString) },
        climatisation: { type: GraphQLNonNull(GraphQLString) },
        doorscount: { type: GraphQLNonNull(GraphQLInt) },
        seatscount: { type: GraphQLNonNull(GraphQLInt) },
        state: { type: GraphQLNonNull(GraphQLBoolean) },
        images: { type: GraphQLNonNull(GraphQLString) },
        address: { type: GraphQLNonNull(GraphQLString) },
        addedDate: { type: GraphQLNonNull(GraphQLString) },
        ownerid: { type: GraphQLNonNull(userType) }
    })
})

const userType = new GraphQLObjectType({
    name: 'user',
    fields: () => ({
        _id: { type: GraphQLNonNull(GraphQLString) },
        ncin: { type: GraphQLNonNull(GraphQLString) },
        username: { type: GraphQLNonNull(GraphQLString) },
        password: { type: GraphQLNonNull(GraphQLString), },
        email: { type: GraphQLNonNull(GraphQLString), },
        access: { type: GraphQLNonNull(GraphQLString), },
        name: { type: GraphQLNonNull(GraphQLString), },
        surname: { type: GraphQLNonNull(GraphQLString), },
        licencenum: { type: GraphQLNonNull(GraphQLString) },
        birthday: { type: GraphQLNonNull(GraphQLString), },
        address: { type: GraphQLNonNull(GraphQLString), },
        profileimg: { type: GraphQLNonNull(GraphQLString) },
        ncinimg: { type: GraphQLNonNull(GraphQLString) },
        agencename: { type: GraphQLNonNull(GraphQLString) },
        joindate: { type: GraphQLNonNull(GraphQLString), },
        phonenum: { type: GraphQLNonNull(GraphQLString), },
        confirmed: { type: GraphQLBoolean },
        notifications: { type: GraphQLList(notificationType) },
        cars: { type: GraphQLList(carType) },
        clients: { type: GraphQLList(userType) }

    })
})

const rootQuery = new GraphQLObjectType({

    name: 'rootQuery',
    fields: () => ({
        allCars: {
            type: GraphQLList(GraphQLNonNull(carType)),
            resolve: async () => {
                try {

                    return await Car.find().populate('ownerid')

                } catch (error) {

                    return new Error(500)
                }
            }
        },
        allRentedCars: {
            type: GraphQLList(GraphQLNonNull(carType)),
            resolve: async () => {

                try {

                    return await Car.find({ state: false }).populate('ownerid')

                } catch (error) {

                    return new Error(500)
                }
            }
        },
        allFreeCars: {
            type: GraphQLList(GraphQLNonNull(carType)),
            resolve: async () => {
                try {

                    return await Car.find({ state: true }).populate('ownerid')

                } catch (error) {

                    return new Error(500)
                }
            }
        },
        cars: {
            type: GraphQLList(GraphQLNonNull(carType)),
            resolve: async (parent, args, req) => {
                if (req.isAuth) {

                    try {

                        return await Car.find({ ownerid: req.user._id }).populate('ownerid')

                    } catch (error) {

                        return new Error(500)
                    }
                }
                return new Error(401)
            }
        },
        freeCars: {
            type: GraphQLList(GraphQLNonNull(carType)),
            resolve: async (parent, args, req) => {
                if (req.isAuth) {
                    try {
                        return await Car.find({ $and: [{ ownerid: req.user._id }, { state: true }] }).populate('ownerid')

                    } catch (error) {
                        return new Error(500)
                    }
                }
                return new Error(401)
            }
        },
        rentedCars: {
            type: GraphQLList(GraphQLNonNull(carType)),
            resolve: async (parent, args, req) => {
                if (req.isAuth) {
                    try {

                        return await Car.find({ $and: [{ ownerid: req.user._id }, { state: false }] }).populate('ownerid')
                    } catch (error) {

                        return new Error(500)
                    }
                }
                return new Error(401)
            }
        },
        carHistory: {
            type: GraphQLList(GraphQLNonNull(rentType)),
            args: {
                carid: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: async (parent, args, req) => {
                if (req.isAuth) {
                    try {

                        return await Rent.find({ $and: [{ carid: args.carid }, { ended: true }] }).populate([{
                            path: 'clientid'
                        }, { path: 'carid' }, { path: 'ownerid' }])

                    } catch (error) {

                        return new Error(500)
                    }
                }
                return new Error(401)
            }
        },
        activeRents: {
            type: GraphQLList(GraphQLNonNull(rentType)),
            resolve: async (parent, args, req) => {
                if (req.isAuth) {
                    try {

                        return await Rent.find({ $and: [{ ownerid: req.user._id }, { active: true }] }).populate([{
                            path: 'clientid'
                        }, { path: 'carid' }, { path: 'ownerid' }])

                    } catch (error) {

                        return new Error(500)
                    }
                }
                return new Error(401)
            }

        },
        unvalidatedRents: {
            type: GraphQLList(GraphQLNonNull(rentType)),
            resolve: async (parent, args, req) => {
                if (req.isAuth) {
                    try {

                        return await Rent.find({ $and: [{ ownerid: req.user._id }, { validated: false }] }).populate([{
                            path: 'clientid'
                        }, { path: 'carid' }, { path: 'ownerid' }])

                    } catch (error) {

                        return new Error(500)
                    }
                }
                return new Error(401)
            }

        },
        reservations: {
            type: GraphQLList(GraphQLNonNull(rentType)),
            resolve: async (parent, args, req) => {
                if (req.isAuth) {
                    try {

                        return await Rent.find({ $and: [{ ownerid: req.user._id }, { validated: true }, { ended: false }] })
                            .populate([{
                                path: 'clientid'
                            }, { path: 'carid' }, { path: 'ownerid' }])

                    } catch (error) {

                        return new Error(500)
                    }
                }
                return new Error(401)
            }
        },
        activeUser: {
            type: GraphQLList(GraphQLNonNull(userType)),
            resolve: async (parent, args, req) => {
                if (req.isAuth) {
                    try {

                        return await User.findOne({ _id: req.user._id })
                            .populate([{
                                path: 'notifications.userid'
                            }, { path: 'notifications.carid' }])

                    } catch (error) {

                        return new Error(500)
                    }
                }
                return new Error(401)
            }
        },
        managers: {
            type: GraphQLList(GraphQLNonNull(userType)),
            args: {
                page: { type: GraphQLNonNull(GraphQLInt) },
                limit: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: async (parent, args) => {
                try {

                    const { docs } = await User.paginate({ access: 'a' },
                        { page: +args.page, limit: +args.limit, populate: [{ path: 'cars' }, { path: 'clients' }] })
                    return docs

                } catch (error) {
                    console.log(error)
                    return new Error(500)
                }
            }

        },


    })

})

const rootMutation = new GraphQLObjectType({

    name: 'rootMutation',
    fields: () => ({

    })
})


module.exports = new GraphQLSchema({
    query: rootQuery
})