var mongoose = require('mongoose');

const mlabURI = 'mongodb://35.228.4.222:27017/mongodb_ns'
const dbName = 'mongodb_ns';

const con = mongoose.connect(mlabURI, { useNewUrlParser: true }, (error) => {
	if(error){
		console.log("Error " + error);
	}else{
		console.log("Connected successfully to server")
	}
});

module.exports = con;