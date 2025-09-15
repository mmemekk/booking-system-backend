const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/booking", require("./routes/bookingRoutes"));
app.use("/restaurant", require("./routes/restaurantRoutes"));

// Routes
app.get("/", (req, res) => {
  res.send("Server is running ✅");
});

app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});
