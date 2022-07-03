const start = require("../dist/index.js").start;
const path = require("path");

const entry = path.join(".", "module/index.js");
const output = path.join(".", "output/bundle.js");

start(entry, output, (err) => {
  console.error("error happened!", err);
});
