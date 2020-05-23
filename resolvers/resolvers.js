const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const User = require('../models/User')
const Rent = require('../models/Rent')
const Car = require('../models/Car')
const io = require('socket.io-client')
const mongoose = require('mongoose')
const socket = io('http://karyatn.amir-ghedira.com');
const { SendRequest, rentEnded, requestAccepted, declinedRequest } = require('../utils/sendMail')
const { Response, ResponsePaginated } = require('../types/Response')
const cloudinary = require('../utils/cloudinary')
const imageName = require('../utils/imageName')

const endRentHandler = async (rentid) => {

    //tofix

    const rent = await Rent.findById(rentid)
        .populate([{
            path: 'client'
        }, { path: 'car' }, { path: 'owner' }])
    rent.active = false;
    rent.ended = true;
    await rent.save();
    const clientNewNotification = {
        _id: new mongoose.Types.ObjectId(),
        userid: rent.owner,
        carid: rent.car,
        type: 'rentended',
        read: false,
        date: new Date().toISOString()
    }
    await User.updateOne({ _id: rent.client._id }, {
        $push: {
            notifications: clientNewNotification
        }
    })
    socket.emit('sendnotification', { userid: rent.client._id, notification: clientNewNotification })
    const managerNewNotification = {
        _id: new mongoose.Types.ObjectId(),
        userid: rent.client,
        carid: rent.car,
        type: 'rentended',
        read: false,
        date: new Date().toISOString()
    }
    await User.updateOne({ _id: rent.owner._id }, {
        $push: {
            notifications: managerNewNotification
        }
    })
    socket.emit('sendnotification', { userid: rent.owner._id, notification: managerNewNotification })

    await Car.updateOne({ _id: rent.car }, { $set: { state: true } })

    rentEnded(rent.client.email, rent.client.username, manager._id, car._id, car.carnumber)
    rentEnded(rent.owner.email, rent.owner.username, rent.client.username, rent.car.carnumber)

}

const activateRentHandler = async (rentid) => {
    try {

        let rent = await Rent.findOne({ _id: rentid })
            .populate([{
                path: 'client'
            }, { path: 'car' }, { path: 'owner' }])

        rent.active = true
        await rent.save()
        await Car.updateOne({ _id: rent.car._id }, { $set: { state: false } })
        const ownerNotification = {
            _id: new mongoose.Types.ObjectId(),
            userid: rent.client,
            car: rent.car,
            type: 'activatedrent',
            read: false
        }
        const clientNotification = {
            _id: new mongoose.Types.ObjectId(),
            userid: rent.owner,
            car: rent.car,
            type: 'activatedrent',
            read: false

        }
        await User.updateOne({ _id: rent.owner._id }, {
            $push: {
                notifications: ownerNotification
            }
        })
        await User.updateOne({ _id: rent.client._id }, {
            $push: {
                notifications: clientNotification
            }
        })
        socket.emit('sendnotification', { userid: rent.owner._id, notification: ownerNotification })
        socket.emit('sendnotification', { userid: rent.client._id, notification: clientNotification })


    } catch (error) {

        console.log(error)
    }
}

exports.getallCars = async (parent, args) => {
    try {

        const result = await Car.paginate({}, { page: +args.page, limit: +args.limit, populate: [{ path: 'owner' }] })
        return new ResponsePaginated(200, 'success', result.docs, null, null, { total: +result.total, pages: +result.pages })

    } catch (error) {
        return new ResponsePaginated(500, error.message)
    }
}
exports.getCar = async (parent, args) => {
    try {
        const car = await Car.findOne({ _id: args._id }).populate('owner')
        if (car) {

            return new Response(200, 'success', car)
        }
        else
            return new Response(404, 'car not found')
    } catch (error) {
        return new Response(500, error.message)
    }
}

exports.getAllRentedCars = async (parent, args) => {

    try {

        const result = await Car.paginate({ state: false }, { page: +args.page, limit: +args.limit, populate: [{ path: 'car' }, { path: 'owner' }, { path: 'client' }] })

        return new ResponsePaginated(200, 'success', result.docs, null, null, { total: result.total, pages: result.pages })

    } catch (error) {

        return new ResponsePaginated(500, error.message)
    }
}

exports.getAllFreeCars = async (parent, args) => {
    try {

        const result = await Car.paginate({ state: true }, { page: +args.page, limit: +args.limit, populate: [{ path: 'car' }, { path: 'owner' }, { path: 'client' }] })
        return new ResponsePaginated(200, 'success', result.docs, null, null, { total: result.total, pages: result.pages })

    } catch (error) {

        return new ResponsePaginated(500, error.message)
    }
}

exports.getCars = async (parent, args, req) => {
    if (req.isAuth) {

        try {

            const cars = await Car.find({ owner: req.user._id }).populate('owner')
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
            const freeCars = await Car.find({ $and: [{ owner: req.user._id }, { state: true }] }).populate('owner')

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

            const rentedCars = await Car.find({ $and: [{ owner: req.user._id }, { state: false }] }).populate('owner')
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

            const carHistory = await Rent.find({ $and: [{ car: args.carid }, { ended: true }] }).populate([{
                path: 'client'
            }, { path: 'car' }, { path: 'owner' }])

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
            const activeRents = await Rent.find({ $and: [{ owner: req.user._id }, { active: true }] }).populate([{
                path: 'client'
            }, { path: 'car' }, { path: 'owner' }])

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

            const unvalidatedRents = await Rent.find({ $and: [{ owner: req.user._id }, { validated: false }] }).populate([{
                path: 'client'
            }, { path: 'car' }, { path: 'owner' }])
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

            const reservations = await Rent.find({ $and: [{ owner: req.user._id }, { validated: true }, { ended: false }] })
                .populate([{
                    path: 'client'
                }, { path: 'car' }, { path: 'owner' }])

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

                return { token: token, user: { ...user._doc, password: 'null' } }
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
                }, { path: 'notifications.carid' }, { path: 'clients' }, { path: 'cars' }])

            return new Response(200, 'success', null, activeUser)
        } catch (error) {

            return new Response(500, error.message)
        }
    }
    return new Response(401, 'Auth failed')
}

exports.getManagers = async (parent, args) => {
    try {

        const { docs, pages, total } = await User.paginate({ access: 'a' },
            { page: +args.page, limit: +args.limit, populate: [{ path: 'cars' }, { path: 'clients' }] })
        return new ResponsePaginated(200, 'success', null, docs, null, { total: +total, pages: +pages })

    } catch (error) {
        return new ResponsePaginated(500, error.message)
    }
}

exports.getUserInfo = async (parent, args, req) => {
    if (req.isAuth) {
        try {
            let info = {};
            const user = await User.findOne({ $and: [{ _id: req.user._id }, { access: 'a' }] }).select('-password')
            info.carscount = user.cars.length;
            info.clientscount = user.clients.length
            let userRents = await Rent.find({ $and: [{ owner: req.user._id }, { validated: true }] })

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
            const archives = await Rent.find({ $and: [{ owner: req.user._id }, { ended: true }] })
                .populate([{ path: 'client' }, { path: 'owner' }, { path: 'car' }])
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
            await Car.updateOne({ $and: [{ _id: args._id, owner: req.user._id }] }, { $set: ops })
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
                            return new Response(500, err.message)
                    });
                })
                user.cars.splice(index, 1)
                await user.save()
                await Car.deleteOne({ _id: args._id })
                await Rent.deleteMany({ car: args._id })
                return new Response(200, 'car successfully deleted')
            }

            return new Response(404, 'car not found')
        } catch (error) {
            return new Response(500, error.message)
        }
    }
    return new Response(401, 'Auth failed')
}

exports.deleteReservation = async (parent, args, req) => {
    if (req.isAuth) {
        try {
            const reservation = await Rent.findOne({ $and: [{ _id: args._id }, { owner: req.user._id }] })

            if (!reservation.active) {
                const newNotifcation = {
                    _id: new mongoose.Types.ObjectId(),
                    userid: reservation.owner,
                    carid: reservation.car,
                    type: 'reservationdeleted',
                    read: false
                }
                await User.updateOne({ _id: reservation.client }, {
                    $push: {
                        notifications: newNotifcation
                    }
                })
                await Rent.deleteOne({ $and: [{ _id: args._id }, { owner: req.user._id }] })
                socket.emit('sendnotification', { userid: reservation.client, notification: newNotifcation })
                console.log('deleted')

                return new Response(200, 'reservation deleted')

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
            const car = await Car.findOne({ _id: args.carid })
            if (car) {
                const rents = await Rent.find({ car: car._id })
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
                        car: car._id,
                        client: req.user._id,
                        owner: args.ownerid,
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
                    socket.emit('sendnotification', { userid: rent.owner, notification: newNotification })

                    if (args.subscribe && !manager.clients.includes(rent.client._id)) {
                        manager.clients.push(rent.client._id)
                        await manager.save()
                        return new Response(201, 'Request successfully sent')

                    }
                    return new Response(201, 'Request successfully sent')
                }
                return new Response(409, 'Car already reserved')
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
                path: 'client'
            }, { path: 'car' }, { path: 'owner' }])
            rent.validated = true;
            await rent.save()
            const NewNotification = {
                _id: new mongoose.Types.ObjectId(),
                userid: rent.owner,
                carid: rent.car,
                type: 'requestaccepted',
                read: false,
                date: new Date().toISOString()
            }
            await User.updateOne({ _id: rent.client }, {
                $push: {
                    notifications: NewNotification
                }
            })
            socket.emit('sendnotification', { userid: rent.client._id, notification: NewNotification })
            setTimeout(() => activateRentHandler(rent._id), new Date(rent.from).getTime() - new Date().getTime());
            setTimeout(() => endRentHandler(rent._id), new Date(rent.to).getTime() - new Date().getTime());
            requestAccepted(rent.client.email, rent.client.username, rent.owner._id, rent.car.carnumber, rent.daterent, rent.owner.agencename)


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
                path: 'client'
            }, { path: 'car' }, { path: 'owner' }])
            const newNotifcation = {
                _id: new mongoose.Types.ObjectId(),
                userid: rent.owner,
                carid: rent.car,
                type: 'declinedrequest',
                read: false
            }
            await User.updateOne({ _id: rent.client._id }, { $push: { notifications: newNotifcation } })
            declinedRequest(rent.client.email, rent.client.username, rent.owner._id, rent.car._id)
            socket.emit('sendnotification', { userid: rent.client._id, notification: newNotifcation })
            await Rent.deleteOne({ _id: args._id })

            return new Response(200, 'Request declined successfully')

        } catch (error) {

            return new Response(500, error.message)
        }
    }
    return new Response(401, 'Auth failed')
}
exports.endRent = async (parent, args, req) => {
    if (req.isAuth) {

        try {
            endRentHandler(args._id)
            return new Response(200, 'rent ended')
        } catch (error) {
            return new Response(500, error.message)
        }
    }
    return new Response(401, 'Auth failed')

}


exports.deleteAllNotifications = async (parent, args, req) => {
    if (req.isAuth) {
        try {

            await User.updateOne({ _id: req.user._id }, { $set: { notifications: [] } })
            return new Response(200, 'notifications cleared')

        } catch (error) {

            return new Response(500, error.message)

        }
    }
    return new Response(401, 'Auth failed')

}

exports.deleteNotification = async (parent, args, req) => {
    if (req.isAuth) {
        try {

            const user = await User.findOne({ _id: req.user._id })
            const index = user.notifications.findIndex(notification => { return notification._id.toString() === args._id })
            user.notifications.splice(index, 1)
            await user.save()
            return new Response(200, 'notification deleted')

        } catch (error) {

            return new Response(500, error.message)
        }
    }
    return new Response(401, 'Auth failed')

}

exports.deleteClient = async (parent, args, req) => {

    if (req.isAuth) {
        try {
            const user = await User.findOne({ _id: req.user._id })
            const clientindex = user.clients.findIndex(client => client.toString() === args._id)
            if (clientindex >= 0) {
                let newClients = user.clients;
                newClients.splice(clientindex, 1);
                user.clients = newClients;
                await user.save()
                return new Response(200, message)
            }
            return new Response(404, 'client not found')


        }
        catch (error) {
            return new Response(500, error.message)

        }
    }
    return new Response(401, 'Auth failed')


}

exports.sendComfirmation = async (parent, args) => {


    try {
        const user = await User.findOne({ email: args.email })
        if (user) {
            const token = jwt.sign(
                {
                    _id: user._id,
                    username: user.username,
                    email: user.email
                }, process.env.JWT_SECRET_KEY
            )
            WelcomeEmail(user.email, user.username, token)
            return new Response(200, 'Email sent')
        }
        return new Response(404, 'User not found')


    } catch (error) {
        return new Response(500, error.message)

    }


}
exports.userComfirmation = async (parent, args) => {

    try {
        const user = jwt.verify(args.token, process.env.JWT_SECRET_KEY)
        await User.updateOne({ _id: user._id }, { $set: { confirmed: true } })
        return new Response(200, 'user successfully confirmed')


    } catch (error) {
        return new Response(500, error.message)

    }


}
exports.sendResetPassEmail = async (parent, args) => {
    try {
        const user = await User.findOne({ email: args.email });
        if (user) {
            const token = jwt.sign(
                {
                    _id: user._id,
                    username: user.username,
                    email: user.email
                }, process.env.JWT_SECRET_KEY
            )

            resetPasswordMail(user.email, user.username, token)
            return new Response(200, 'Email sent')


        }
        return new Response(404, 'User with this email not found')


    } catch (error) {
        return new Response(500, error.message)

    }

}
exports.confirmResetPass = async (parent, args, req) => {


    try {
        jwt.verify(args.token, process.env.JWT_SECRET_KEY);
        return new Response(200, 'User is valide')

    } catch (error) {

        return new Response(401, 'user isn\'t valide')

    }


}
exports.subscribeTo = async (parent, args, req) => {

    if (req.isAuth) {

        try {
            const user = await User.findOne({ $and: [{ _id: args._id }, { access: 'a' }] });
            if (!user.clients.includes(req.user._id)) {

                user.clients.push(req.user._id)
                user.save()
                return new Response(200, 'subscription done')
            }
            return new Response(409, 'you are already subscribed')


        } catch (error) {
            return new Response(500, error.message)

        }
    }
    return new Response(401, 'Auth failed')

}
exports.resetPassword = async (parent, args) => {

    try {
        const decodeduser = jwt.verify(args.token, process.env.JWT_SECRET_KEY)
        const hashedpw = await bcrypt.hash(args.newPassword, 11);
        await User.updateOne({ _id: decodeduser._id }, { $set: { password: hashedpw } })
        return new Response(200, 'User password successfully updated')

    } catch (error) {
        return new Response(500, error.message)
    }


}
exports.updateUserPass = async (parent, args, req) => {

    if (req.isAuth) {

        try {
            const user = await User.findOne({ _id: req.user._id })
            const result = await bcrypt.compare(args.oldPassword, user.password)
            if (result) {
                user.password = await bcrypt.hash(args.newPassword, 11);
                await user.save()
                return new Response(400, 'Password successfully updated')
            }
            return new Response(400, 'Passwords didn\'t match')


        } catch (error) {
            return new Response(500, error.message)

        }
    }
    return new Response(401, 'Auth failed')

}
exports.updateUserInfo = async (parent, args, req) => {

    if (req.isAuth) {

        let ops = {};
        for (let obj of args.fields) {
            ops[obj.propName] = obj.value
        }
        try {
            await User.updateOne({ _id: req.user._id }, { $set: ops })
            return new Response(200, 'user updated successfully')


        } catch (error) {
            return new Response(500, error.message)

        }
    }
    return new Response(401, 'Auth failed')

}

exports.markAsReadAllNotif = async (parent, args, req) => {

    if (req.isAuth) {

        try {
            const user = await User.findOne({ _id: req.user._id });
            const newNotifications = user.notifications;
            newNotifications.forEach(notification => {
                notification.read = true;
            })
            await User.updateOne({ _id: req.user._id }, { $set: { notifications: newNotifications } })
            return new Response(200, 'notifications updated')


        } catch (error) {
            return new Response(500, error.message)

        }
    }
    return new Response(401, 'Auth failed')

}
exports.markAsReadNotif = async (parent, args, req) => {

    if (req.isAuth) {

        try {
            const user = await User.findOne({ _id: req.user._id });
            const index = user.notifications.findIndex(notification => notification._id.toString() === args._id)
            user.notifications[index].read = true;
            await user.save()
            return new Response(200, 'notification updated')


        } catch (error) {
            return new Response(500, error.message)

        }
    }
    return new Response(401, 'Auth failed')

}

exports.updateUserImage = async (parent, args, req) => {

    if (req.isAuth) {

        try {
            const user = await User.findOne({ _id: req.user._id })
            if (user) {
                cloudinary.uploader.destroy(ImageName(user.profileimg), (result, err) => {

                })
                user.profileimg = req.file.secure_url;
                await user.save()
                return new Response(200, 'user image updated successfully')

            }
            return new Response(404, 'user not found')


        } catch (error) {
            return new Response(500, error.message)

        }
    }
    return new Response(401, 'Auth failed')

}

