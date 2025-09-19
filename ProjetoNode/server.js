const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const serviceRoutes = require("./routes/serviceRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");

const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));

// Rotas principais
app.use("/services", serviceRoutes);
app.use("/appointments", appointmentRoutes);

app.get("/", (req, res) => {
  const services = require("./data/services.json");
  res.render("home", { services });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
