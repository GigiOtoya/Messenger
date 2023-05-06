(function() {
    requireUser();

    function displayMessage(message) {
        const messageList = document.getElementById("message-list");
        const item = document.createElement("li");

        const header = document.createElement("div");
        header.classList.add("message-header");

        const user = document.createElement("span");
        user.classList.add("header-user");
        user.textContent = message.user;

        const timeStamp = document.createElement("span");
        timeStamp.classList.add("header-time");
        timeStamp.textContent = message.time;

        header.appendChild(user);
        header.appendChild(timeStamp);

        const body = document.createElement("div");
        body.classList.add("message-body");
        body.textContent = message.body;

        item.appendChild(header);
        item.appendChild(body);


        messageList.appendChild(item);
        item.scrollIntoView();
    }

    function displayUser(name) {
        const userlist = document.getElementById("user-list");
        const newUser = document.createElement("li");
        newUser.textContent = name;
        userlist.appendChild(newUser);
    }

    function clearUsers() {
        const userlist = document.getElementById("user-list");
        userlist.querySelectorAll("li").forEach(li => {
            li.remove();
        })
    }

    function requireUser() {
        const options = {
            method: "GET",
            redirect: 'follow',
            headers: {
                "Content-Type": "application/json"
            },
        }
        
        fetch("/", options)
            .then(res => {
                if (res.redirected) {
                    window.location.replace(res.url);
                }
            });
        
        fetch("/data", options)
            .then(res => res.json())
            .then(data => {
                data.forEach(msg => {
                    displayMessage(msg);
                })
                socket.on("login", (message) => {
                    displayMessage(message);
                })
            })
            .catch(err => {
                console.error(`error: ${err}`);
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

    // retrieve message from server
    socket.on("chat", (message) => {
        displayMessage(message);
    });
    
    socket.on("updateUsers", () => {
        const options = {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
        };

        clearUsers();
        fetch("/users", options)
            .then(res => res.json())
            .then(users => {
                users.forEach(user => {
                    displayUser(user.name);
                })
            })
    })
    
})();