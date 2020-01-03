"use strict";
const express = require("express");
const path = require("path");
const app = express();
const excelToJson = require("convert-excel-to-json");
const fs = require("fs");
const request = require("request");
const fileUpload = require("express-fileupload");

app.use(express.static(path.join(__dirname, "build")));
app.use(express.static("public"));
app.use(express.static("src"));
app.use(fileUpload());

app.post("/uploaded", function(req, res) {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let sampleFile = req.files.sampleFile;

  // Use the mv() method to place the file somewhere on your server
  sampleFile.mv("./src/frse.xlsx", function(err) {
    if (err) return res.status(500).send(err);

    res.sendFile(path.join(__dirname + "/uploaded.html"));
  });
});

app.get("/upload", (req, res) => {
  res.sendFile(path.join(__dirname + "/upload.html"));
});

app.get("/json", (req, res) => {
  const result = excelToJson({
    sourceFile: "src/frse.xlsx"
  });

  fs.writeFile("src/frse.json", JSON.stringify(result), function(err) {
    // Deal with possible error here.
  });

  res.sendFile(path.join(__dirname + "/json.html"));
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(8080);
