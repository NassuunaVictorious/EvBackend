const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");
exports.register = async (req, res) => {

    const { name, email, password } = req.body;

    try {

        const hashedPassword =
            await bcrypt.hash(password, 10);

        await pool.query(

            `
            INSERT INTO users(name,email,password)
            VALUES($1,$2,$3)
            `,

            [name, email, hashedPassword]

        );

        res.json({
            success: true
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: "Registration failed"
        });

    }

};
exports.login = async (req, res) => {

    const { email, password } = req.body;

    try {

        const result = await pool.query(

            "SELECT * FROM users WHERE email=$1",

            [email]

        );

        if(result.rows.length === 0){

            return res.status(401).json({
                error:"Invalid credentials"
            });

        }

        const user = result.rows[0];

        const valid =
            await bcrypt.compare(password, user.password);

        if(!valid){

            return res.status(401).json({
                error:"Invalid credentials"
            });

        }

        const token = jwt.sign(

            {
                id:user.id,
                email:user.email
            },

            process.env.JWT_SECRET,

            {
                expiresIn:"7d"
            }

        );

        res.json({

            token,

            user:{

                id:user.id,
                name:user.name,
                email:user.email

            }

        });

    } catch(err){

        console.error(err);

        res.status(500).json({
            error:"Login failed"
        });

    }

};