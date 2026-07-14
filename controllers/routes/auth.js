const express = require("express");
const router = express.Router();
const { login, register } = require("../authController");
router.post("/register", register);
router.post("/login", login);

module.exports = router;


document
    .getElementById("loginBtn")
    .addEventListener("click", async () => {

        const email =
            document.getElementById("email").value;

        const password =
            document.getElementById("password").value;

        try {

            const result =
                await login(email, password);

            localStorage.setItem(
                "token",
                result.token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(result.user)
            );

            window.location = "index.html";

        } catch (err) {

            alert("Login failed");

            console.error(err);

        }

    });