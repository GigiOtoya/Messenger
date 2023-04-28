(function() {
    const socket = io();

    const postBtn = document.getElementById("post-btn");

    postBtn.addEventListener("click", (e)=> {
        e.preventDefault();
        const textField = document.getElementById("textfield");
        if (textField.value) {
            // send message to server
            socket.emit("message", textField.value);
            textField.value = "";
        }

    });

    // retrieve message from server
    socket.on("message", (msg) => {
        console.log(msg);
        const messageList = document.getElementById("message-list");
        const newMessage = document.createElement("li");
        newMessage.textContent = msg;

        messageList.appendChild(newMessage);
        
    });
    
})();