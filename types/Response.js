const Response = class Response {
    message;
    status;
    data = { cars: [], users: [], rents: [] };

    constructor(status, message, cars, users, rents) {

        this.message = message
        this.status = status;
        if (cars) {
            if (cars.length !== undefined) {
                this.data.cars = cars

            } else {

                this.data.cars = [cars]
            }
        } else {
            this.data.cars = null
        }
        if (users) {
            if (users.length !== undefined) {
                this.data.users = users

            } else {

                this.data.users = [users]
            }
        } else {
            this.data.users = null
        }
        if (rents) {
            if (rents.length !== undefined) {
                this.data.rents = rents

            } else {

                this.data.rents = [rents]
            }
        } else {
            this.data.rents = null
        }
    }
}


const ResponsePaginated = class ResponsePaginated extends Response {

    paginateddata = { total: null, pages: null };
    constructor(status, message, cars, users, rents, { total: total, pages: pages }) {
        super(status, message, cars, users, rents)
        this.paginateddata.total = total;
        this.paginateddata.pages = pages;

    }
}

module.exports = { Response, ResponsePaginated }