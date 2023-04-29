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
    socket.on("chat", (chatObj) => {
        // console.log(msg);
        const messageList = document.getElementById("message-list");
        const item = document.createElement("li");

        const header = document.createElement("div");
        header.classList.add("message-header");

        const user = document.createElement("span");
        user.classList.add("header-user");
        user.textContent = "user";

        const timeStamp = document.createElement("span");
        timeStamp.classList.add("header-time");
        timeStamp.textContent = chatObj.time;

        header.appendChild(user);
        header.appendChild(timeStamp);

        const body = document.createElement("div");
        body.classList.add("message-body");
        body.textContent = chatObj.message;

        item.appendChild(header);
        item.appendChild(body);


        messageList.appendChild(item);
        
    });
    
})();