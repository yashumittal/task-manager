const mongoose = require("mongoose");

const connectionURL = process.env.MONGODB_URL

const db = mongoose.connect(connectionURL, {
	useUnifiedTopology: true,
	useCreateIndex: true,
	useNewUrlParser: true,
});