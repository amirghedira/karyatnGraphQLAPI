# Overview 
This is another versions of the previous karyatn API made with GraphQL.

Note that all the functionalities are the same with the previous API (made with `express.js`) and the goal here is to use GraphQL to handle API queries. You can find more information about the previous version of this API [here](https://www.amirghedira.com/project/Karyatn%20Backend/Nodejs%20-%20Express%20-%20MongoDB/60d7487ad7e12a0017340e70)

# Features
## Database
To store this application data we have used mongoDB as our database along with mongoose which is an npm package that allow as to interact with mongoDB.

# Queries
This API exposes these queries (a query in GraphQL means a request that doesnt save or store any thing on the database usually for getting data):

![graphql queries](https://amirplatform.s3.eu-central-1.amazonaws.com/project/gnw1ytn76bor1agfdnpc.png)

* `allCars`: returns available cars based on the page number and the limit of each page (pagination).
* `car`: returns a car based on the carID.
* `allRentedCars`: returns rented cars based on the page number and the limit of each page.
* `allFreeCars`: returns free and available cars based on the page number and the limit of each page.
* `cars`: returns all manager cars (accessible by the manager only).
* `freeCars`: returns all free cars of the manager (accessible by the manager only).
* `rentedCars`: returns all rented cars of the manager (accessible by the manager only).
* `carHistory`: returns all previous rents related to a specific car.
* `activeRents`: returns all active rents of the manager (accessible by the manager only).
* `unvalidatedRents`: returns all rents of the manager which was not validated by him (accessible by the manager only).
* `reservations`: returns client reservations to the manager (accessible by the manager only)
* `login`: a query to authenticate users and returns an access token if the login succeeded.
* `user`: return a specific user based on an ID.
* `activeUser`: returns the connected user (based on the access token).
* `managers`: returns a list of managers (owners of the cars published to be rented).
* `userInformations`: returns the current user's information (username, email, address etc...).

*