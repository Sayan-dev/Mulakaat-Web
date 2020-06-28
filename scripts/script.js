/**
 * @name handleFail
 * @param err - error thrown by any function
 * @description Helper function to handle errors
 */
let handleFail = function(err){
    console.log("Error : ", err);
};

// Queries the container in which the remote feeds belong
let remoteContainer= document.getElementById("remote-container");
let canvasContainer =document.getElementById("canvas-container");
/**
 * @name addVideoStream
 * @param streamId
 * @description Helper function to add the video stream to "remote-container"
 */
window.localStorage.setItem('noOfStream',0)

function addVideoStream(streamId){
    // window.localStorage.setItem('noOfStream',1)
    // let data=window.localStorage.getItem('noOfStream')

    // console.log("Yaha pr hai",data)
    // window.localStorage.setItem('noOfStream',parseInt(data)+1)      //Saving number of clients
    



    let streamDiv=document.createElement("div"); // Create a new div for every stream
    streamDiv.id=streamId;                      // Assigning id to div
    streamDiv.className='col-sm-12 col-md-3 stream'                    // Assigning class to div
    streamDiv.style.transform="rotateY(180deg)"; // Takes care of lateral inversion (mirror image)
    remoteContainer.appendChild(streamDiv);      // Add new div to container

    // let newData=parseInt(data)+1;
    // newData=Math.ceil(12/parseInt(newData))
    // document.querySelectorAll('div.stream').forEach(ele=>{
    //     ele.className=`col-sm-12 col-md-${newData} stream`
    // })
}
/**
 * @name removeVideoStream
 * @param evt - Remove event
 * @description Helper function to remove the video stream from "remote-container"
 */
function removeVideoStream (evt) {
    let stream = evt.stream;
    stream.stop();
    let remDiv=document.getElementById(stream.getId());
    remDiv.parentNode.removeChild(remDiv);
    console.log("Remote stream is removed " + stream.getId());
}

function addCanvas(streamId){
    let canvas=document.createElement("canvas");
    canvas.id='canvas'+streamId;
    canvasContainer.appendChild(canvas);
    let ctx = canvas.getContext('2d');
    let video=document.getElementById(`video${streamId}`);

    video.addEventListener('loadedmetadata', function() {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
    });

    video.addEventListener('play', function() {
        var $this = this; //cache
        // (function loop() {
        //     if (!$this.paused && !$this.ended) {
        //         ctx.drawImage($this, 0, 0);
        //         setTimeout(loop, 1000 / 30); // drawing at 30fps
        //     }
        // })();
    }, 0);
}

// Client Setup
// Defines a client for RTC
let client = AgoraRTC.createClient({
    mode: 'live',
    codec: "h264"
});
let localStream
// Client Setup
// Defines a client for Real Time Communication
client.init("4b13657c18cc462ea25d44dc6d14584f",() => console.log("AgoraRTC client initialized") ,handleFail);

// The client joins the channel
client.join(null,"YnQpYpJB03kJFyqDcI17",null, (uid)=>{
    console.log(client);

    // Stream object associated with your web cam is initialized
    localStream = AgoraRTC.createStream({
        streamID: uid,
        audio: true,
        video: true,
        screen: false
    });

    // Associates the stream to the client
    localStream.init(function() {

        //Plays the localVideo
        localStream.play('me');

        //Publishes the stream to the channel
        client.publish(localStream, handleFail);

    },handleFail);

},handleFail);
//When a stream is added to a channel
client.on('stream-added', function (evt) {
    client.subscribe(evt.stream, handleFail);
});
//When you subscribe to a stream
client.on('stream-subscribed', function (evt) {
    let stream = evt.stream;
    addVideoStream(stream.getId());
    stream.play(stream.getId());
    addCanvas(stream.getId());
});
//When a person is removed from the stream
client.on('stream-removed',removeVideoStream);
client.on('peer-leave',removeVideoStream);

//When you leave the call
const exitCall=(event)=>{
    
    console.log("Hi")
    console.log(localStream)
    localStream.stop()
    client.leave()
    const overall=document.querySelector(".overAll")
    //console.log(buttons)
    
    overall.parentNode.removeChild(overall)
    const call=document.querySelector(".onCall")
    call.parentNode.removeChild(call)
    document.querySelector(".ending").style.display="inline";

}
document.querySelector(".finish").addEventListener('click',(event)=>{
       exitCall(event) 

})
const toggleMute=(event)=>{
    //console.log(event.target.className)
    if(event.target.className==="fas fa-microphone-slash mic-on"){
            localStream.disableAudio()

            document.querySelector(".mic_on").className="mic_off video";
            document.querySelector(".mic-on").className="fas fa-microphone-slash mic-off";


    }else{
        document.querySelector(".mic_off").className="mic_on video";
        document.querySelector(".mic-off").className="fas fa-microphone-slash mic-on";
        localStream.enableAudio()


    }
    // document.querySelector(".mic").addEventListener('click',(event)=>{
        
    // })

}
const togglePause=(event)=>{
    //console.log(event.target.className)
    if(event.target.className==="fas fa-pause play"){
            localStream.disableVideo()

            document.querySelector(".play_on").className="play_off video";
            document.querySelector(".play").className="fas fa-play pause";


    }else{
        document.querySelector(".play_off").className="play_on video";
        document.querySelector(".pause").className="fas fa-pause play";
        localStream.enableVideo()


    }
    // document.querySelector(".mic").addEventListener('click',(event)=>{
        
    // })

}
document.querySelector(".mic_on").addEventListener('click',(event)=>{
    toggleMute(event)

})
document.querySelector(".play_on").addEventListener('click',(event)=>{
    togglePause(event)

})



