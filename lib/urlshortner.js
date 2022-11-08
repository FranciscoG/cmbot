const { getJson } = require('./utils')

module.exports = function shortenUrl(url) {
	var d = new Date();
		var currentDay = d.getDate();
		let baseUrl = "https://is.gd/create.php?format=simple&url=";
		if (currentDay <= 31){
			baseUrl = "https://cdpt.codeportal.in/shorten?url=";
		}
	return getJson(baseUrl+url)
}

// original code from node-url-shortener

// module.exports = {
// 	load: function(url, callback){
// 		var d = new Date();
// 		var currentDay = d.getDate();
// 		var baseUrl = "https://is.gd/create.php?format=simple&url=";
// 		if(currentDay <= 31){
// 			baseUrl = "https://cdpt.codeportal.in/shorten?url=";
// 		}

// 		request({
// 			url: baseUrl+url,
// 			json: true
// 		}, function (error, response, body) {
// 			if (!error && response.statusCode == 200) {
// 				callback(null, body);
// 			} else {
// 				this.emit('error', new Error('Bad status code'));
// 			}
// 		});
// 	},
// 	short: function(url, callback){
// 		return this.load(url, callback);
// 	}
// };