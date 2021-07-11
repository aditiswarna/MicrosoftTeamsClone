const socket = io('/')
const videoGrid = document.getElementById('video-grid')

//using peerjs
const myPeer = new Peer(undefined, {
    host:'peerjs-server.herokuapp.com',
    port: '443',
    secure: 'true'
})

const myVideo = document.createElement('video')
myVideo.muted = true

const peers ={}

//prompts user for permission to use a media input which produces a MediaStream
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideo(myVideo, stream)

    //in the event of a call
    myPeer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideo(video, userVideoStream)
        })
    })

    //socket.on('user-connected', userId => {
    //    connectToNewUser(userId, stream)
    //})
    socket.on('user-connected', userId => {
        // user is joining
        setTimeout(() => {
          // user joined
          connectToNewUser(userId, stream)
        }, 3000)
    })
})

socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close()
    //console.log(userId)
})
 
myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})



//function for when another user joins call
function connectToNewUser(userId, stream){
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideo(video, userVideoStream)
    })
    //removing user when they leave
    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call
}


//function to add video to screen
function addVideo(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}