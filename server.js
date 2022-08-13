require("dotenv").config();
require("express-async-errors");
require("colors");
// ... EXPRESS
const express = require("express");
const app = express();

// ... EXTRA SECURITY
app.set("trust proxy", 1);
const rateLimit = require("express-rate-limit");
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    max: 100, // limit each IP to 100 per windowMs
  })
);

app.use(express.json());
// ... EXTRA SECURITY
const helmet = require("helmet");
app.use(helmet());
const cors = require("cors");
app.use(cors());
const xss = require("xss-clean");
app.use(xss());

// ... MIDDLEWARE
const AuthenticateUser = require("./middleware/authentication");

app.get("/", (req, res) => res.send("Jobs API"));

// ... ROUTES
const AuthRoutes = require("./routes/auth-routes");
app.use("/api/v1/auth", AuthRoutes);
const JobRoutes = require("./routes/job-routes");
app.use("/api/v1/jobs", AuthenticateUser, JobRoutes);

// ... ERROR HANDLER
const notFoundMiddleware = require("./middleware/not-found");
app.use(notFoundMiddleware);
const errorHandlerMiddleware = require("./middleware/error-handler");
app.use(errorHandlerMiddleware);

// ... CONNECTIONS
const connectDB = require("./config/connect-db");
const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    connectDB(process.env.MONGO_URI);
    app.listen(PORT, console.log(`Server is listening in ${process.env.NODE_ENV} mode on port: ${PORT}`.yellow));
  } catch (error) {
    console.error(error);
  }
};

start();
