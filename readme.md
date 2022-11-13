# Overview 
This is another versions of the previous karyatn API made with GraphQL.

Note that all the functionalities are the same with the previous API (made with `express.js`) and the goal here is to use GraphQL to handle API queries. You can find more information about the previous version of this API [here](https://www.amirghedira.com/project/Karyatn%20Backend/Nodejs%20-%20Express%20-%20MongoDB/60d7487ad7e12a0017340e70)

# Launch the project
## backend
To launch the project, you have to first add a `.env` folder in the root directory that will hold the environment variables of the backend. You can find a `.env.example` folder as reference for the environment variables used.
Note that you need a cloudinary account to used in the backend as storage service.

After adding a `.env` file, you have to install the NodeJS packages on the backend (the project holds both the frontend under the client folder and the backend in the root directory of the project)

To install the backend Node packages, simply run:
``` bash
npm install
```
To run the backend server, run:
``` bash
npm start
```
To run the backend server in development mode, run:
``` bash
npm start:dev
```
Note that the server will listen on port `3000`

# Features
## Database
To store this application data we have used mongoDB as our database along with mongoose which is an npm package that allow as to interact with mongoDB.

## Queries
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
* `reservations`: returns client reservations to the manager (accessible by the manager only).
* `login`: a query to authenticate users and returns an access token if the login succeeded.
* `user`: return a specific user based on an ID.
* `activeUser`: returns the connected user (based on the access token).
* `managers`: returns a list of managers (owners of the cars published to be rented).
* `userInformations`: returns the current user's information (username, email, address etc...).
* `archive`: returns all rents which has ended to the manager (accessible by the manager only).

## Mutations
This API exposes these mutations (a mutation in GraphQL means a request that affect the database usually for saving, deleting or updating data):

![mutations_1](https://amirplatform.s3.eu-central-1.amazonaws.com/project/sodkv2eogadbgugh8sg4.png)
![mutations_2](https://amirplatform.s3.eu-central-1.amazonaws.com/project/iyh4xa4ls4pmvpzz6gzq.png)

* `updateCar`:  updates a specific car based on the ID
* `deleteCar`:  deletes a specific  car based on the ID
* `deleteReservation`:  delete a specific car reservation based on the ID
* `endRent`:  mark the rent as ended (when the client returns the vehicule to the owner).
* `sendRequest`: send a request to the owner of the car to make a reservation.
* `validateRequest`: mark a client request as accepted.
* `declineRequest`: mark a client request as declined.
* `deleteAllNotifications`:  delete all current user notifications.
* `deleteNotification`:  delete a specific notification based on the ID.
* `deleteClient`:  delete a client based on the ID (the client is automatically added to the manager once the client rent a car).
* `sendConfirmation`:  send a confirmation email to the user to confirm his account after creating it
* `userConfirmation`: confirm a user account based on a token (usually this token is present on the email sent to the user) 
* `sendResetPassEmail`:  send a reset password email to the user.
* `confirmResetPass`:  confirm whether the user is legitimate to process a reset password based on a token (usually this token is present on the email sent to the user)
* `resetPassword`: reset a user password (a token needs to be provided to validate the user legitimacy).
* `subscribeTo`: allows a user to subscribe to a manager (to receive notification and emails about cars availability). 
* `updateUserPass`: update current user password.
 * `updateUserInfo`: update current user's informations such as email, username and address.
 * `markAsReadAllNotif`: mark all current user notifications as read.
 * `markAsReadNotif`: mark a current user notification as read based on the ID.
 * `updateUserImage`: update the current user profile image.
