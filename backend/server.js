// Entry point — loads environment variables and starts the HTTP server.
require("dotenv").config();

const app  = require("./app");
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`VertexArc server running on port ${PORT}`);
});