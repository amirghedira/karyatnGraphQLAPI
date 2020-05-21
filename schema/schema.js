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

const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const User = require('../models/User')
const Rent = require('../models/Rent')
const Car = require('../models/Car')
const io = require('socket.io-client')
const socket = io('http://karyatn.amir-ghedira.com');
const resolvers = require('../resolvers/resolvers');
const { SendRequest, rentEnded, requestAccepted, declinedRequest } = require('../utils/sendMail')


const endRentHandler = async (rentid) => {

    //tofix

    const rent = await Rent.findById(rentid)
        .populate([{
            path: 'clientid'
        }, { path: 'carid' }, { path: 'ownerid' }])
    rent.active = false;
    rent.ended = true;
    await rent.save();
    const clientNewNotification = {
        _id: new mongoose.Types.ObjectId(),
        userid: rent.ownerid,
        carid: rent.carid,
        type: 'rentended',
        read: false,
        date: new Date().toISOString()
    }
    await User.updateOne({ _id: rent.clientid._id }, {
        $push: {
            notifications: clientNewNotification
        }
    })
    socket.emit('sendnotification', { userid: rent.clientid._id, notification: clientNewNotification })
    const managerNewNotification = {
        _id: new mongoose.Types.ObjectId(),
        userid: rent.clientid,
        carid: rent.carid,
        type: 'rentended',
        read: false,
        date: new Date().toISOString()
    }
    await User.updateOne({ _id: rent.ownerid._id }, {
        $push: {
            notifications: managerNewNotification
        }
    })
    socket.emit('sendnotification', { userid: rent.ownerid._id, notification: managerNewNotification })

    await Car.updateOne({ _id: rent.carid }, { $set: { state: true } })

    rentEnded(rent.clientid.email, rent.clientid.username, manager._id, car._id, car.carnumber)
    rentEnded(rent.ownerid.email, rent.ownerid.username, rent.clientid.username, rent.carid.carnumber)

}

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
            resolve: resolvers.getallCar
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
            type: ResponseType,
            resolve: resolvers.getAllRentedCars
        },
        allFreeCars: {
            type: ResponseType,
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
            resolve: async (parent, args, req) => {

                if (req.isAuth) {
                    let ops = {};
                    for (let obj of args.fields) {
                        ops[obj.propName] = obj.value
                    }
                    try {
                        await Car.updateOne({ $and: [{ _id: args._id, ownerid: req.user._id }] }, { $set: ops })
                        return new Response(200, 'car updated successfully')
                    } catch (error) {

                        return new Response(500, error.message)
                    }
                }
                return new Response(401, 'Auth failed')
            }
        },
        deleteCar: {
            type: ResponseType,
            args: {
                _id: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: async (parent, args, req) => {
                if (req.isAuth) {
                    try {
                        const user = await User.findOne({ _id: req.user._id }).populate('cars')
                        let usercarsid = user.cars.map(car => { return car._id })
                        if (usercarsid.includes(args._id)) {
                            const index = usercarsid.findIndex(carid => { return carid.toString() === args._id })
                            user.cars[index].images.forEach(image => {

                                cloudinary.uploader.destroy(imageName(image), (result, err) => {
                                    if (err)
                                        res.status(500).json({ error: err })
                                });
                            })
                            user.cars.splice(index, 1)
                            await user.save()
                            await Car.deleteOne({ _id: args._id })
                            await Rent.deleteMany({ carid: args._id })
                            return new Response(200, 'car successfully deleted')
                        }

                        return new Response(404, 'car not found')
                    } catch (error) {
                        return new Response(500, error.message)
                    }
                }
                return new Response(401, 'Auth failed')
            }
        },
        deleteReservation: {
            type: ResponseType,
            args: {
                _id: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: async (parent, args, req) => {
                if (req.isAuth) {

                    try {
                        const reservation = await Rent.findOne({ $and: [{ _id: args._id }, { ownerid: req.user._id }] })

                        if (!reservation.active) {
                            const newNotifcation = {
                                _id: new mongoose.Types.ObjectId(),
                                userid: reservation.ownerid,
                                carid: reservation.carid,
                                type: 'reservationdeleted',
                                read: false
                            }
                            await User.updateOne({ _id: reservation.clientid }, {
                                $push: {
                                    notifications: newNotifcation
                                }
                            })
                            await Rent.deleteOne({ $and: [{ _id: args._id }, { ownerid: req.user._id }] })
                            socket.emit('sendnotification', { userid: reservation.clientid, notification: newNotifcation })
                            return new Response(409, 'reservation deleted')

                        }
                        return new Response(409, 'reservation is active')

                    } catch (error) {

                        return new Response(500, error.message)
                    }
                }
                return new Response(401, 'Auth failed')
            }
        },
        endRent: {
            type: ResponseType,
            args: {
                _id: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: (parent, args, req) => {
                if (req.isAuth) {

                    try {
                        endRentHandler(args._id)
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
            resolve: async (parent, args, req) => {

                if (req.isAuth) {

                    try {
                        const car = await Car.findOne({ _id: req.body.carid })
                        if (car) {
                            const rents = await Rent.find({ carid: car._id })
                            let validDate = { state: true, fromdate: null, todate: null };
                            rents.forEach(rent => {
                                if (!rent.ended && rent.validated && new Date(args.fromdate).getTime() <= new Date(rent.to).getTime() && new Date(args.fromdate).getTime() >= new Date(rent.from).getTime()) {
                                    validDate.state = false;
                                    validDate.fromdate = rent.from
                                    validDate.todate = rent.to
                                }
                            })
                            if (validDate.state) {
                                const rent = new Rent({
                                    carid: car._id,
                                    clientid: req.user._id,
                                    ownerid: args.ownerid,
                                    totalprice: args.totalprice,
                                    from: args.fromdate,
                                    to: args.todate,
                                    daterent: new Date().toISOString()
                                })
                                await rent.save()
                                const client = await User.findById(req.user._id)
                                const newNotification = {
                                    _id: new mongoose.Types.ObjectId(),
                                    userid: client,
                                    carid: car,
                                    read: false,
                                    date: new Date().toISOString(),
                                    type: 'request'
                                }
                                let manager = await User.findOneAndUpdate({ _id: args.ownerid }, {
                                    $push: {
                                        notifications: newNotification
                                    }
                                })

                                SendRequest(manager.email, manager.username, client.username, client._id)
                                socket.emit('sendnotification', { userid: rent.ownerid, notification: newNotification })

                                if (req.body.subscribe && !manager.clients.includes(rent.clientid._id)) {
                                    manager.clients.push(rent.clientid._id)
                                    await manager.save()
                                    res.status(201).json({ message: 'Request accepted successfully' })
                                    return;

                                }
                                return new Response(201, 'Request successfully sent')
                            }
                            return new Response(201, 'Car already reserved')
                            // res.status(409).json({ message: 'Car already reserved', fromdate: validDate.fromdate, todate: validDate.todate })
                        }
                        return new Response(404, 'Car not found')

                    } catch (error) {

                        return new Response(500, error.message)

                    }
                }
                return new Response(401, 'Auth failed')

            }
        },
        validateRequest: {
            type: ResponseType,
            args: {
                _id: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: async (parent, args, req) => {
                if (req.isAuth) {
                    try {
                        let rent = await Rent.findOne({ _id: args._id }).populate([{
                            path: 'clientid'
                        }, { path: 'carid' }, { path: 'ownerid' }])
                        rent.validated = true;
                        await rent.save()
                        const NewNotification = {
                            _id: new mongoose.Types.ObjectId(),
                            userid: rent.ownerid,
                            carid: rent.carid,
                            type: 'requestaccepted',
                            read: false,
                            date: new Date().toISOString()
                        }
                        await User.updateOne({ _id: rent.clientid }, {
                            $push: {
                                notifications: NewNotification
                            }
                        })
                        socket.emit('sendnotification', { userid: rent.clientid._id, notification: NewNotification })
                        setTimeout(() => activateRentHandler(rent._id), new Date(rent.from).getTime() - new Date().getTime());
                        setTimeout(() => endRentHandler(rent._id), new Date(rent.to).getTime() - new Date().getTime());
                        requestAccepted(rent.clientid.email, rent.clientid.username, rent.ownerid._id, rent.carid.carnumber, rent.daterent, rent.ownerid.agencename)


                        return new Response(200, 'Request accepted successfully')


                    } catch (error) {

                        return new Response(500, error.message)
                    }
                }
                return new Response(401, 'Auth failed')

            }
        },
        declinedRequest: {

            type: ResponseType,
            args: {

                _id: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: async (parent, args, req) => {
                if (req.isAuth) {

                    try {

                        const rent = await Rent.findById(args._id).populate([{
                            path: 'clientid'
                        }, { path: 'carid' }, { path: 'ownerid' }])
                        const newNotifcation = {
                            _id: new mongoose.Types.ObjectId(),
                            userid: rent.ownerid,
                            carid: rent.carid,
                            type: 'declinedrequest',
                            read: false
                        }
                        await User.updateOne({ _id: rent.clientid._id }, { $push: { notifications: newNotifcation } })
                        declinedRequest(rent.clientid.email, rent.clientid.username, rent.ownerid._id, rent.carid._id)
                        socket.emit('sendnotification', { userid: rent.clientid._id, notification: newNotifcation })
                        await Rent.deleteOne({ _id: req.body.rentid })

                        return new Response(200, 'Request declined successfully')

                    } catch (error) {

                        return new Response(500, error.message)
                    }
                }
                return new Response(401, 'Auth failed')
            }
        },
    })
})


module.exports = new GraphQLSchema({
    query: rootQuery,
    mutation: rootMutation
})