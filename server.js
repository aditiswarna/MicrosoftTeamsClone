//backend web app framework used is Express.js
const express = require('express')
const app = express()

//using uuids to create unique links
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')

//What is in the environment variable PORT, or 3000 if there's nothing there
const port = process.env.PORT || 3000

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})


//action when user joins or leave the room with id roomId
io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId)
        socket.broadcast.to(roomId).emit('user-connected', userId)

        socket.on('disconnect', ()=> {
            socket.broadcast.to(roomId).emit('user-disconnected', userId)
        })
    })
})

server.listen(port)