const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const User = require('../models/User')
const Rent = require('../models/Rent')
const Car = require('../models/Car')
const io = require('socket.io-client')
const socket = io('http://karyatn.amir-ghedira.com');
const { SendRequest, rentEnded, requestAccepted, declinedRequest } = require('../utils/sendMail')
const Response = require('../types/Response')




exports.getallCars = async () => {
    try {
        // const allcars = await Car.find().populate('ownerid')
        // return new Response(200, 'success', allcars)
        return new Error('loolita')

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

exports.updateCar = async (parent, args, req) => {

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

exports.deleteCar = async (parent, args, req) => {
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

deleteReservation = async (parent, args, req) => {
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

exports.sendRequest = async (parent, args, req) => {

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

exports.validateRequest = async (parent, args, req) => {
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

exports.declineRequest = async (parent, args, req) => {
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

exports.endRent = async (rentid) => {

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