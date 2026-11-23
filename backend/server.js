// Entry point — loads environment variables and starts the HTTP server.
require("dotenv").config({ path: __dirname + "/.env" });

const app    = require("./app");
const initDb = require("./initDb");
const PORT   = process.env.PORT || 5000;

initDb().then(() => {
    app.listen(PORT, () => {
        console.log(`VertexArc server running on port ${PORT}`);
    });
});