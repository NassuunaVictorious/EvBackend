const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const pool = require("./db");

const authRoutes = require("./controllers/routes/auth");


const app = express();


// Create HTTP server for Socket.IO
const server = http.createServer(app);


// Socket.IO setup
const io = new Server(server, {

    cors: {
        origin: "https://serene-squirrel-97b2d8.netlify.app/"
    }

});


console.log("⚡ ChargeFlow server starting");


// =========================
// MIDDLEWARE
// =========================

app.use(cors({

origin:[
    
"https://serene-squirrel-97b2d8.netlify.app/"

]

}));

app.use(express.json());


// =========================
// ROUTES
// =========================


// Authentication
app.use("/auth", authRoutes);



// Test route
app.get("/", (req,res)=>{

    res.send(
        "EV Weather Backend is running successfully"
    );

});



// =========================
// STATIONS
// =========================


// Get all stations

app.get("/stations", async(req,res)=>{


    try{


        const result =
        await pool.query(
            "SELECT * FROM stations"
        );


        res.json(
            result.rows
        );


    }
    catch(err){

        console.error(err);


        res.status(500).json({

            error:"Database error"

        });

    }


});





// Update station

app.post("/stations/update", async(req,res)=>{


    const {
        id,
        status,
        queue
    } = req.body;



    try{


        await pool.query(

            `
            UPDATE stations
            SET status=$1,
                queue=$2
            WHERE id=$3
            `,

            [
                status,
                queue,
                id
            ]

        );



        const updated =
        await pool.query(
            "SELECT * FROM stations"
        );



        // Send update to all connected users

        io.emit(
            "stations:update",
            updated.rows
        );



        res.json({

            success:true,

            stations:updated.rows

        });



    }
    catch(err){


        console.error(err);


        res.status(500).json({

            error:"Update failed"

        });


    }


});





// =========================
// COMMUNITY REPORTS
// =========================


app.post("/community/report", async(req,res)=>{


    const {
        station_id,
        message,
        type
    } = req.body;



    try{


        await pool.query(

            `
            INSERT INTO reports
            (
                station_id,
                message,
                type
            )

            VALUES
            ($1,$2,$3)

            `,

            [
                station_id,
                message,
                type
            ]

        );



        const report = {

            station_id,

            message,

            type

        };



        // Real-time notification

        io.emit(
            "community:new",
            report
        );



        res.json({

            success:true

        });



    }
    catch(err){


        console.error(err);


        res.status(500).json({

            error:"Report failed"

        });


    }


});




// =========================
// SOCKET CONNECTION
// =========================


io.on(
"connection",
(socket)=>{


    console.log(
        "User connected:",
        socket.id
    );



    socket.on(
    "disconnect",
    ()=>{


        console.log(
            "User disconnected:",
            socket.id
        );


    });


});




// =========================
// START SERVER
// =========================


const PORT = process.env.PORT || 3000;


server.listen(
PORT,
()=>{


    console.log(
        ` ChargeFlow running on port ${PORT}`
    );


});