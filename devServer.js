import express from "express";
const app = express();
const path = require('path');
const port = 3000;

app.use('/', express.static(path.join(__dirname, 'dist')));

app.listen(port, () => {
	console.log(`Dev server listening on port ${port}`);
});
