/*
  This file is used to log the output of the child process to a file.
*/

const { spawn } = require("child_process");
const fs = require("fs");
const log_file = fs.createWriteStream(__dirname + "../debug.log", { flags: "w", encoding: "utf8" });

const command = "yarn";
const args = ["run", "dev"]; // Split the command arguments

const child = spawn(command, args);

// Helper function to format the data with a timestamp
function formatWithTimestamp(data) {
  const timestamp = new Date().toISOString();
  return `${timestamp}: ${data}`;
}

child.stdout.on("data", (data) => {
  log_file.write(formatWithTimestamp(data));
});

child.stderr.on("data", (data) => {
  log_file.write(formatWithTimestamp(data));
});

child.on("close", (code) => {
  log_file.end();
});
