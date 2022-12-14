// Import express to create a web server using routes
const express = require('express')
// Import bcrypt to hash user passwords and salts
const bcrypt = require('bcrypt')
// Create express server and call it app
const app = express()

require('dotenv').config()

// Import jsonwebtoken to be able to generate JWTs
const jwt = require('jsonwebtoken')

// Store this in DB in real scenario
const users = []

const posts = [
    {
        username: 'Yazeed',
        title: 'Post 1'
    },
    {
        username: 'Jim',
        title: 'Post 2'
    },
]

// This will allow our express web server to accept JSON
// add `express.json` Express-provided middleware which will parse JSON requests into
// JS objects before they reach the route files.
// To use the JSON data passed into a request body by parsing it into a JS object.
// Alternative 3rd-party bodyparser package is 'app.use(body-parser.urlencoded({ : false}))'
// The method `.use` sets up middleware for the Express application
app.use(express.json())


// GET all user posts
// Uses authenticateToken Middleware function since only a logged in user can request this data
app.get('/posts', authenticateToken, (req, res) => {
    console.log('REQ.USER: ', req.user)
    res.json(posts.filter( post => post.username === req.user.name ))
})


// MIDDLEWARE to verify JWT and return the JWT's user stored inside it when sent with request to access an endpoint.
function authenticateToken(req, res, next) {
    // Get the JWT sent by the user from the request authorization header
    // Token stored in auth header as 'Bearer TOKEN'
    console.log('REQ.HEADERS: ', req.headers)
    const authHeader = req.headers['authorization']
    // Gets the token portion after Bearer
    // Verify we have a header first. If we do, return the token, otherwise, return null
    const token = authHeader && authHeader.split(' ')[1]
    console.log('TOKEN: ', token)
    if(token === null) {
        return res.sendStatus(401)
    }
    // Verify token and that this is the correct user
    // This is where the JWT signature is verified
    // It takes the JWT header and payload and hashes it with secret key using the crypto algorithm
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        // 403 Unauthorized (Forbidden) - meaning we see you have a JWT, but it is no longer valid.
        if(err) {
            return res.sendStatus(403)
        }
        // This means you are authorized and set user in req to be able to access it in the REST endpoint
        // user object here is brought in from the /login route where we serialzed user object (user) whenever a user logs in
        // Then return that user to the GET /posts endpoint
        req.user = user
        // Once this middleware is done, move on to the next middleware function
        next()
    })
}

// Server listening for requests on port 3000
app.listen(3000, () => {
    console.log('Server running on port 3000')
})