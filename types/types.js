const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLBoolean,
    GraphQLNonNull,
    GraphQLFloat,
    GraphQLInt,
    GraphQLList

} = require('graphql')


const notificationType = new GraphQLObjectType({
    name: 'notification',
    fields: () => ({
        _id: { type: GraphQLNonNull(GraphQLString) },
        userid: { type: userType },
        carid: { type: carType },
        type: { type: GraphQLNonNull(GraphQLString) },
        read: { type: GraphQLNonNull(GraphQLBoolean) },
        date: { type: GraphQLNonNull(GraphQLString) }
    })
})

const userType = new GraphQLObjectType({
    name: 'user',
    fields: () => ({
        _id: { type: GraphQLNonNull(GraphQLString) },
        ncin: { type: GraphQLString },
        username: { type: GraphQLNonNull(GraphQLString) },
        password: { type: GraphQLNonNull(GraphQLString), },
        email: { type: GraphQLNonNull(GraphQLString), },
        access: { type: GraphQLNonNull(GraphQLString), },
        name: { type: GraphQLNonNull(GraphQLString), },
        surname: { type: GraphQLNonNull(GraphQLString), },
        licencenum: { type: GraphQLString },
        birthday: { type: GraphQLNonNull(GraphQLString), },
        address: { type: GraphQLNonNull(GraphQLString), },
        profileimg: { type: GraphQLString },
        ncinimg: { type: GraphQLString },
        agencename: { type: GraphQLString },
        joindate: { type: GraphQLNonNull(GraphQLString), },
        phonenum: { type: GraphQLNonNull(GraphQLString), },
        confirmed: { type: GraphQLBoolean },
        notifications: { type: GraphQLList(notificationType) },
        cars: { type: GraphQLList(carType) },
        clients: { type: GraphQLList(userType) }

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
        images: { type: GraphQLList(GraphQLNonNull(GraphQLString)) },
        address: { type: GraphQLNonNull(GraphQLString) },
        addedDate: { type: GraphQLNonNull(GraphQLString) },
        percentage: { type: GraphQLList(GraphQLInt) },
        owner: { type: userType }
    })
})

const rentType = new GraphQLObjectType({
    name: 'rent',
    fields: () => ({

        _id: { type: GraphQLNonNull(GraphQLString) },
        car: { type: GraphQLNonNull(carType) },
        client: { type: GraphQLNonNull(userType) },
        owner: { type: GraphQLNonNull(userType) },
        totalprice: { type: GraphQLNonNull(GraphQLFloat) },
        from: { type: GraphQLNonNull(GraphQLString) },
        to: { type: GraphQLNonNull(GraphQLString) },
        daterent: { type: GraphQLNonNull(GraphQLString) },
        validated: { type: GraphQLNonNull(GraphQLBoolean) },
        active: { type: GraphQLNonNull(GraphQLBoolean) },
        ended: { type: GraphQLNonNull(GraphQLBoolean) }
    })
})

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

const logedUserType = new GraphQLObjectType({
    name: 'logeduser',
    fields: () => ({
        user: { type: GraphQLNonNull(userType) },
        token: { type: GraphQLNonNull(GraphQLString) }

    })
})

module.exports = { userType, carType, rentType, logedUserType, notificationType, userInfoType }