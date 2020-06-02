const fs = require('fs-extra');

fs.copy('./package.json', './dist-deploy/package.json', err => {
   if (err) return console.log(err);

   console.log("package.json file copied to dist folder");
});