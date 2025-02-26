const fs = require("fs");
const path = require("path");

// Path to package.json
const packagePath = path.resolve(__dirname, "../package.json");

// Read package.json
const packageData = require(packagePath);

// Remove the devDependencies field
delete packageData.devDependencies;
delete packageData.dependencies;

// Write the updated package.json back to the file
fs.writeFileSync(packagePath, JSON.stringify(packageData, null, 2));

console.log("Removed Dependencies from package.json");
