(function() {
    requireUser();

    function requireUser() {
        const options = {
            method: "GET",
            redirect: 'follow',
            headers: {
                "Content-Type": "application/json"
            },
        }
        fetch("/", options)
            .then( res => {
                console.log(res)
                if (res.redirected) {
                    window.location.replace(res.url);
                }
            })
    }
    
    const logoutBtn = document.getElementById("logout-btn");

    logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();

        const options = {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
        };
        fetch("/", options)
            .then( res => {
                if (res.redirected) {
                    window.location.replace(res.url);
                }
            })
    })


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
        textField.focus();
    });

    // add new user to list
    socket.on("login", (user) => {
        const userlist = document.getElementById("user-list");
        const newUser = document.createElement("li");
        newUser.textContent = user;
        userlist.appendChild(newUser);
    })
    // retrieve message from server
    socket.on("chat", (chatObj) => {
        // console.log(msg);
        const messageList = document.getElementById("message-list");
        const item = document.createElement("li");

        const header = document.createElement("div");
        header.classList.add("message-header");

        const user = document.createElement("span");
        user.classList.add("header-user");
        user.textContent = chatObj.user;

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
        item.scrollIntoView();
        
    });
    
})();