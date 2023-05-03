(function() {
    const loginBtn = document.getElementById("login-btn");

    loginBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const user = document.getElementById("name").value;
        if (user) {
            const options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({user})
            };
            fetch("/login", options)
                .then( res => {
                    console.log(res)
                    if (res.redirected) {
                        window.location.replace(res.url);
                    }
                })
        }
    })
})();