const express = require("express");

let app = express();

app.use(express.static("public"));

app.listen(5500, () => {
    console.log("le site marche");
})