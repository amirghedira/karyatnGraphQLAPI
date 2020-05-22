const Response = class Response {
    message;
    status;
    data = { cars: [], users: [], rents: [] };

    constructor(status, message, cars, users, rents) {

        this.message = message
        this.status = status;
        this.data.cars = cars ? !cars.length || cars.length === 0 ? [cars] : cars : null;
        this.data.users = users ? !users.length || users.length === 0 ? [users] : users : null;
        this.data.rents = rents ? !rents.length || rents.length === 0 ? [rents] : rents : null;
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