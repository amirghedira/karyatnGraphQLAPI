const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const User = require('../models/User')
const Rent = require('../models/Rent')
const Car = require('../models/Car')
const io = require('socket.io-client')
const socket = io('http://karyatn.amir-ghedira.com');



exports.getallCars = async () => {
    try {

        const allcars = await Car.find().populate('ownerid')
        return new Response(200, 'success', allcars)

    } catch (error) {

        return new Response(500, error.message)
    }
}
exports.getCar = async (parent, args) => {
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

exports.getAllRentedCars = async () => {

    try {

        return await Car.find({ state: false }).populate('ownerid')

    } catch (error) {

        return new Response(500, error.message)
    }
}

exports.getAllFreeCars = async () => {
    try {

        const allfreeCars = await Car.find({ state: true }).populate('ownerid')
        return new Response(200, 'success', allfreeCars)

    } catch (error) {

        return new Response(500, error.message)
    }
}

exports.getCars = async (parent, args, req) => {
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
exports.getFreeCars = async (parent, args, req) => {
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

exports.getRentedCars = async (parent, args, req) => {
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

exports.getCarHistory = async (parent, args, req) => {
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

exports.getActiveRents = async (parent, args, req) => {
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

exports.getUnvalidatedRents = async (parent, args, req) => {
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

exports.getReservations = async (parent, args, req) => {
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

exports.userLogin = async (parent, args) => {
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

exports.getUser = async (parent, args) => {

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

exports.getActiveUser = async (parent, args, req) => {
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

exports.getManagers = async (parent, args) => {
    try {

        const { docs } = await User.paginate({ access: 'a' },
            { page: +args.page, limit: +args.limit, populate: [{ path: 'cars' }, { path: 'clients' }] })
        return new Response(200, 'success', null, docs)

    } catch (error) {
        console.log(error)
        return new Response(500, error.message)
    }
}

exports.getUserInfo = async (parent, args, req) => {
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

exports.getArchive = async (parent, args, req) => {
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