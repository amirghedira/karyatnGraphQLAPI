const Response = class Response {
    message;
    status;
    data = { cars: [], users: [], rents: [] };

    constructor(status, message, cars, users, rents) {

        this.message = message
        this.status = status;
        console.log(cars.length)
        this.data.cars = cars ? !cars.length ? [cars] : [...cars] : null;
        this.data.users = users ? !users.length ? [users] : users : null;
        this.data.rents = rents ? !rents.length ? [rents] : rents : null;
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