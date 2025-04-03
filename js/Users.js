const users = [


    { email: "kaua.silva@adoro.com.br", password: "//" },
    { email: "luis.rocha@adoro.com.br", password: "*1234" },


];

document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorMsg = document.getElementById("errorMsg");
    const loadingScreen = document.getElementById("loadingScreen");

    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        errorMsg.textContent = "";
        loadingScreen.style.display = "flex";

        setTimeout(() => {
            window.location.href = "home.html";
        }, 3000);
    } else {
        errorMsg.textContent = "Email ou senha inválidos!";
    }
});