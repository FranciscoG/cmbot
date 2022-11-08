const https = require("https");

function escapeRegExp(str) {
  return str.replace(/[-[\]/{}()*+?.\\^$|]/g, "\\$&");
}

function getRandomNumber(min, max) {
  var r = Math.floor((max - min - 1) * Math.random()) + min;
  return r;
}

/**
 * return fomatted timestamp like 3:04pm or 12:52am
 * h = Hours; no leading zero for single-digit hours (12-hour clock).
 * MM = Minutes; leading zero for single-digit minutes.
 * tt = Lowercase, two-character time marker string: am or pm.
 * @param {Date} date
 * @returns {string} formatted to h:MMtt
 */
function formatTime(date) {
  if (!date) date = new Date();
  let hours = date.getHours(); // as 24hr clock
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "pm" : "am";
  // convert hours to 12hr clock
  hours = hours > 12 ? hours - 12 : hours;
  return `${hours}:${minutes}${ampm}`;
}

/**
 * returns month/day string
 * m = Month as digits; no leading zero for single-digit months.
 * d = Day of the month as digits; no leading zero for single-digit days.
 * @param {Date} date
 * @returns {string} formatted to m/d
 */
function formatMonthDay(date) {
  if (!date) date = new Date();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}/${day}`;
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (resp) => {
        let data = "";

        // A chunk of data has been received.
        resp.on("data", (chunk) => {
          data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on("end", () => {
          try {
            const json = JSON.parse(data);
            resolve(json);
          } catch (error) {
            reject(error);
          }
        });
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

module.exports = {
  escapeRegExp,
  getRandomNumber,
  formatTime,
  formatMonthDay,
  getJson,
};
