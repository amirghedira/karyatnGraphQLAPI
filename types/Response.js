module.exports = class Response {
    message;
    status;
    data = { cars: [], users: [], rents: [] };

    constructor(status, message, cars, users, rents) {
        this.message = message
        this.status = status;
        this.data.cars = cars ? !cars.length ? [cars] : cars : null;
        this.data.users = users ? !users.length ? [users] : users : null;
        this.data.rents = rents ? !rents.length ? [rents] : rents : null;
    }

}