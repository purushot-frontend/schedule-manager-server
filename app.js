const dotenv = require("dotenv");
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const Email = require("./utils/email");
const userRoutes = require("./routes/user");
const employeeRoleRoutes = require("./routes/employeeRole");
const employeeRoutes = require("./routes/employee");
const blueprintRoutes = require("./routes/blueprint");
const scheduleRoutes = require("./routes/schedule");
dotenv.config({ path: "./config.env" });
const app = express();

//GLOBAL MIDDLEWARES

// Setting CORS
var allowedOrigins = [
  "http://localhost:3001/",
  "http://localhost:3000/",
  "http://127.0.0.1:3000/",
  "http://127.0.0.1:3001/",
  "http://schedcheck.com/",
  "http://dev.schedcheck.com",
];
// app.use(
//   cors({
//     origin: function(origin, callback) {
//       // allow requests with no origin
//       // (like mobile apps or curl requests)
//       if (!origin) return callback(null, true);
//       if (allowedOrigins.indexOf(origin) === -1) {
//         var msg =
//           "The CORS policy for this site does not " +
//           "allow access from the specified Origin.";
//         return callback(new Error(msg), false);
//       }
//       return callback(null, true);
//     },
//   })
// );
app.use(cors());

// setting time zone
process.env.TZ = "UTC";

// Body parser, reading data from body into req.body
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));
app.use(cookieParser());

//default api
app.get("/", async (req, res) => {
  res.send({ message: "direct access not allowed" });
});


//routes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/module/employeeRole", employeeRoleRoutes);
app.use("/api/v1/module/employee", employeeRoutes);
app.use("/api/v1/module/blueprint", blueprintRoutes);
app.use("/api/v1/module/schedule", scheduleRoutes);

//catch errors
app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    status: "error",
    message: error.message,
  });
});

//invalid url
app.all("*", function (req, res) {
  res.status(404).json({
    status: "error",
    message: "Invalid URL.",
  });
});

module.exports = app;
