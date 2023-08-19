const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const config = require("./app/config/config.js");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// database
const db = require("./app/models");
const Role = db.role;

db.sequelize.sync();

// API ROUTES
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);
require("./app/routes/member.routes")(app);

// app.use(express.static(__dirname + '/dist/frontend'));

// app.get('/*', function(req, res) {
//   res.sendFile(__dirname + '/dist/frontend/index.html');
// });

app.use(function(req, res, next) {
  res.status(404).send({message: 'Route not found'});
});

const PORT = config.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

