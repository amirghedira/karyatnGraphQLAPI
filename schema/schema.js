const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLBoolean,
    GraphQLList,
    GraphQLNonNull,
    GraphQLFloat,
    GraphQLInt,
    GraphQLUnionType

} = require('graphql')

const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const User = require('../models/User')
const Rent = require('../models/Rent')
const Car = require('../models/Car')


class Response {
    message;
    status;
    data = { cars: [], users: [], rents: [] };

    constructor(status, message, cars, users, rents) {
        this.message = message
        this.status = status;
        this.data.cars = cars ? this.data.cars.push(cars) : null;
        this.data.users = users ? this.data.users.push(users) : null;
        this.data.rents = rents ? this.data.rents.push(rents) : null;
    }
    getResponse() {
        return this
    }
}




const userInfoType = new GraphQLObjectType({
    name: 'userinfomations',
    fields: () => (
        {
            carscount: { type: GraphQLNonNull(GraphQLInt) },
            clientscount: { type: GraphQLNonNull(GraphQLInt) },
            activerents: { type: GraphQLNonNull(GraphQLInt) },
            inactiverents: { type: GraphQLNonNull(GraphQLInt) },
            totalrevenues: { type: GraphQLNonNull(GraphQLFloat) },
            totalRents: { type: GraphQLNonNull(GraphQLInt) },
            mouthsProfits: { type: GraphQLList(GraphQLFloat) },
            yearsProfits: { type: GraphQLList(GraphQLFloat) },
        }
    )
})
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

const ResponseType = new GraphQLObjectType({
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
const errorType = new GraphQLObjectType({
    name: 'error',
    fields: () => ({
        status: { type: GraphQLNonNull(GraphQLInt) },
        error: { type: GraphQLNonNull(GraphQLString) },

    })
})

const logedUserType = new GraphQLObjectType({
    name: 'logeduser',
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
        clients: { type: GraphQLList(userType) },
        token: { type: GraphQLNonNull(GraphQLString) }

    })
})

const rootQuery = new GraphQLObjectType({

    name: 'rootQuery',
    fields: () => ({
        allCars: {
            type: ResponseType,
            resolve: async () => {
                try {

                    const allcars = await Car.find().populate('ownerid')
                    return new Response(200, 'success', allcars)

                } catch (error) {

                    return new Response(500, error.message)
                }
            }
        },
        car: {
            type: ResponseType,
            args: {
                _id: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: async (parent, args) => {
                try {
                    const car = await Car.findOne({ _id: args._id }).populate('ownerid')
                    if (car) {

                        return new Response(200, 'success', car)
                    }
                    else
                        return new Response(404, 'car not found')
                } catch (error) {
                    console.log(error)
                    return new Response(500, error.message)
                }
            }
        }
        ,
        allRentedCars: {
            type: ResponseType,
            resolve: async () => {

                try {

                    return await Car.find({ state: false }).populate('ownerid')

                } catch (error) {

                    return new Response(500, error.message)
                }
            }
        },
        allFreeCars: {
            type: ResponseType,
            resolve: async () => {
                try {

                    const allfreeCars = await Car.find({ state: true }).populate('ownerid')
                    return new Response(200, 'success', allfreeCars)

                } catch (error) {

                    return new Response(500, error.message)
                }
            }
        },
        cars: {
            type: ResponseType,
            resolve: async (parent, args, req) => {
                if (req.isAuth) {

                    try {

                        const cars = await Car.find({ ownerid: req.user._id }).populate('ownerid')
                        return new Response(200, 'success', cars)

                    } catch (error) {

                        return new Response(500, error.message)
                    }
                }
                return new Response(401, 'Auth failed')
            }
        },
        freeCars: {
            type: ResponseType,
            resolve: async (parent, args, req) => {
                if (req.isAuth) {
                    try {
                        const freeCars = await Car.find({ $and: [{ ownerid: req.user._id }, { state: true }] }).populate('ownerid')

                        return new Response(200, 'success', freeCars)


                    } catch (error) {
                        return new Response(500, error.message)
                    }
                }
                return new Response(401, 'Auth failed')
            }
        },
        rentedCars: {
            type: ResponseType,
            resolve: async (parent, args, req) => {
                if (req.isAuth) {
                    try {

                        const rentedCars = await Car.find({ $and: [{ ownerid: req.user._id }, { state: false }] }).populate('ownerid')
                        return new Response(200, 'success', rentedCars)
                    } catch (error) {

                        return new Response(500, error.message)
                    }
                }
                return new Response(401, 'Auth failed')
            }
        },
        carHistory: {
            type: ResponseType,
            args: {
                carid: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: async (parent, args, req) => {
                if (req.isAuth) {
                    try {

                        const carHistory = await Rent.find({ $and: [{ carid: args.carid }, { ended: true }] }).populate([{
                            path: 'clientid'
                        }, { path: 'carid' }, { path: 'ownerid' }])

                        return new Response(200, 'success', null, null, carHistory)
                    } catch (error) {

                        return new Response(500, error.message)
                    }
                }
                return new Response(401, 'Auth failed')
            }
        },
        activeRents: {
            type: ResponseType,
            resolve: async (parent, args, req) => {
                if (req.isAuth) {
                    try {
                        const activeRents = await Rent.find({ $and: [{ ownerid: req.user._id }, { active: true }] }).populate([{
                            path: 'clientid'
                        }, { path: 'carid' }, { path: 'ownerid' }])

                        return new Response(200, 'success', null, null, activeRents)


                    } catch (error) {

                        return new Response(500, error.message)
                    }
                }
                return new Response(401, 'Auth failed')
            }

        },
        unvalidatedRents: {
            type: ResponseType,
            resolve: async (parent, args, req) => {
                if (req.isAuth) {
                    try {

                        const unvalidatedRents = await Rent.find({ $and: [{ ownerid: req.user._id }, { validated: false }] }).populate([{
                            path: 'clientid'
                        }, { path: 'carid' }, { path: 'ownerid' }])
                        return new Response(200, 'success', null, null, unvalidatedRents)
                    } catch (error) {

                        return new Response(500, error.message)
                    }
                }
                return new Response(401, 'Auth failed')
            }

        },
        reservations: {
            type: ResponseType,
            resolve: async (parent, args, req) => {
                if (req.isAuth) {
                    try {

                        const reservations = await Rent.find({ $and: [{ ownerid: req.user._id }, { validated: true }, { ended: false }] })
                            .populate([{
                                path: 'clientid'
                            }, { path: 'carid' }, { path: 'ownerid' }])

                        return new Response(200, 'success', null, null, reservations)
                    } catch (error) {

                        return new Response(500, error.message)
                    }
                }
                return new Response(401, 'Auth failed')
            }
        },
        login: {
            type: logedUserType,
            args: {
                username: { type: GraphQLNonNull(GraphQLString) },
                password: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: async (parent, args) => {
                try {
                    const user = await User.findOne({ username: args.username })
                        .populate([{
                            path: 'notifications.userid'
                        }, { path: 'notifications.carid' }])
                    if (user) {
                        const result = await bcrypt.compare(args.password, user.password)
                        if (result) {

                            const token = jwt.sign({
                                _id: user._id,
                                username: user.username,
                                email: user.email
                            }, process.env.JWT_SECRET_KEY)

                            return { token: token, ...user._doc, password: null }
                        }

                        return new Error(404)

                    }
                    return new Error(404)
                } catch (error) {
                    return new Response(500, error.message)
                }
            }
        },
        user: {
            type: ResponseType,
            args: {
                _id: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: async (parent, args) => {

                try {
                    const user = await User.findOne({ _id: args._id }).populate([{ path: 'cars' }, { path: 'clients' }, {
                        path: 'notifications.userid'
                    }, { path: 'notifications.carid' }]).select('-password')
                    if (user)
                        return new Response(200, 'success', null, user)
                    return new Response(200, 'user not found')

                } catch (error) {

                    new Response(500, error.message)
                }
            }
        },
        activeUser: {
            type: ResponseType,
            resolve: async (parent, args, req) => {
                if (req.isAuth) {
                    try {

                        const activeUser = await User.findOne({ _id: req.user._id })
                            .populate([{
                                path: 'notifications.userid'
                            }, { path: 'notifications.carid' }])

                        return new Response(200, 'success', null, activeUser)
                    } catch (error) {

                        return new Response(500, error.message)
                    }
                }
                return new Response(401, 'Auth failed')
            }
        },
        managers: {
            type: ResponseType,
            args: {
                page: { type: GraphQLNonNull(GraphQLInt) },
                limit: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: async (parent, args) => {
                try {

                    const { docs } = await User.paginate({ access: 'a' },
                        { page: +args.page, limit: +args.limit, populate: [{ path: 'cars' }, { path: 'clients' }] })
                    return new Response(200, 'success', null, docs)

                } catch (error) {
                    console.log(error)
                    return new Response(500, error.message)
                }
            }

        },
        userInformations: {
            type: userInfoType,
            resolve: async (parent, args, req) => {
                if (req.isAuth) {
                    try {
                        let info = {};
                        const user = await User.findOne({ _id: req.user._id }).select('-password')
                        info.carscount = user.cars.length;
                        info.clientscount = user.clients.length
                        let userRents = await Rent.find({ $and: [{ ownerid: req.user._id }, { validated: true }] })

                        info.activerents = 0;
                        info.inactiverents = 0;
                        info.totalrevenues = 0;
                        info.totalRents = 0;
                        info.mouthsProfits = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                        info.yearsProfits = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
                        userRents.forEach(userRent => {
                            if (!userRent.ended) {

                                if (userRent.active)
                                    info.activerents++;
                                else
                                    info.inactiverents++;
                            } else {

                                info.totalrevenues += +userRent.totalprice
                                if (new Date().getFullYear().toString() === userRent.from.toISOString().split('-')[0]) {
                                    let month = userRent.from.toISOString().split('-')[1]
                                    if (month < 10)
                                        month = month.split('0')[1];
                                    info.mouthsProfits[month - 1] += +userRent.totalprice;
                                }
                                info.yearsProfits[new Date().getFullYear() - +userRent.from.toISOString().split('-')[0]] += +userRent.totalprice

                            }
                            info.totalRents++;
                        });

                        return { ...info }
                    } catch (error) {
                        return new Response(500, error.message)

                    }
                }
                return new Response(401, 'Auth failed')
            }
        },
        archive: {
            type: ResponseType,
            resolve: async (parent, args, req) => {
                if (req.isAuth) {
                    try {
                        const archives = await Rent.find({ $and: [{ ownerid: req.user._id }, { ended: true }] })
                            .populate([{ path: 'clientid' }, { path: 'ownerid' }, { path: 'carid' }])
                        return new Response(200, 'success', null, null, archives)
                    } catch (error) {
                        return new Response(500, error.message)
                    }
                }
                return new Response(401, 'Auth failed')
            }
        }

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