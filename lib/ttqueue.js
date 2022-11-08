var ttqueue = function (cmbot, saveCallback) {
  this.cmbot = cmbot;

  this.USER_IN_QUEUE = 0;
  this.USER_ON_DECKS = 1;
  this.USER_NOT_FOUND = 2;
  this.USER_NOT_IN_QUEUE = 3;
  this.ALREADY_YOINKED = 4;

  this.queueArray = [];

  this.saveCallback = saveCallback;
};

ttqueue.prototype.setQueue = function (_queue) {
  this.queueArray = _queue;
};

ttqueue.prototype.saveQueue = function () {
  if (typeof this.saveCallback === "function") this.saveCallback(this.queueArray);
  else console.log("not a function");
};

ttqueue.prototype.newAddUser = function (user) {
  var result = {
    success: false,
  };
  if (typeof user !== "object") {
    result.code = this.USER_NOT_FOUND;
    return result;
  }
  if (user.djing) {
    result.code = this.USER_ON_DECKS;
    return result;
  }

  if (this.queueArray.indexOf(user.userid) > -1) {
    result.code = this.USER_IN_QUEUE;
    result.spot = this.queueArray.indexOf(user.userid) + 1;
    return result;
  }
  this.queueArray.push(user.userid);
  result.success = true;
  result.spot = this.queueArray.indexOf(user.userid) + 1;
  result.queue = this.printQueue(true);
  this.saveQueue();
  return result;
};

// user should be of the form {name: 'foo', userid: 'bar'}
ttqueue.prototype.addUser = function (user) {
  //	console.log("adding user ", user);
  var checkUser = this.cmbot.getUserByName(user.name);
  if (!checkUser) return this.USER_NOT_FOUND;
  var queueArray = this.queueArray;

  if (queueArray.includes(user.userid)) {
    return this.USER_IN_QUEUE;
  }

  this.queueArray.push(user.userid);
  this.saveQueue();
  return true;
};

ttqueue.prototype.getQueueFull = function () {
  const cmbot = this.cmbot;
  return this.queueArray.map((userid) => {
    const user = cmbot.users[userid];
    return {
      name: user.name,
      afk: user.afk ? 1 : 0,
    };
  });
};

ttqueue.prototype.removeUser = function (user) {
  if (this.queueArray.includes(user.userid)) {
    this.queueArray = this.queueArray.filter((userid) => userid !== user.userid);
    clearTimeout(user.timers.queueTimer);
    this.saveQueue();
    return true;
  }
  return this.USER_NOT_IN_QUEUE;
};

ttqueue.prototype.addUserByName = function (name) {
  //	console.log("adding user " + name);
  var matchedUser = this.cmbot.getUserByName(name);
  //	console.log("matched user: ", matchedUser);
  //		console.log("users on decks: ", usersOnDecks);
  //		console.log("this is " + usersOnDecks[matchedUser.userid]);
  if (matchedUser.djing) return this.USER_ON_DECKS;
  if (matchedUser !== false) return this.addUser(matchedUser);
  else return this.USER_NOT_FOUND;
};

ttqueue.prototype.removeUserByName = function (name) {
  const matchedUser = this.cmbot.getUserByName(name);
  if (!matchedUser) {
    return this.USER_NOT_FOUND;
  }
  if (!this.queueArray.includes(matchedUser.userid)) {
    return this.USER_NOT_IN_QUEUE;
  }
  return this.removeUser(matchedUser);
};

ttqueue.prototype.newRemoveUser = function (userid) {
  var result = {
    success: false,
  };
  if (this.queueArray.indexOf(userid) == -1) {
    result.code = this.USER_NOT_IN_QUEUE;
  } else {
    this.queueArray.splice(this.queueArray.indexOf(userid), 1);
    result.success = true;
  }
  return result;
};

ttqueue.prototype.printQueue = function (ret = false) {
  var cmbot = this.cmbot;
  var text = "";
  if (this.queueArray.length === 0) {
    if (this.cmbot.session.djs.length < this.cmbot.session.max_djs) {
      text = "The queue is currently empty, but since there's an open DJ spot, just step up!";
    } else {
      text = "The queue is currently empty. Type /addme to add yourself.";
    }
  } else {
    const queueNames = this.queueArray.map(userid => {
      const user = cmbot.users[userid];
      const status = user.afk || !user.present ? "  (away)" : "";
      return `${user.name}${status}`;
    });
    text = "Current queue: " + queueNames.join(", ");
  }
  if (ret) {
    return text;
  } else {
    mySpeak(text);
  }
};

ttqueue.prototype.getQueueLength = function (noafk) {
  var cmbot = this.cmbot;
  noafk = noafk || false;
  if (!noafk) return this.queueArray.length;
  return this.queueArray.reduce((total, userid) => {
    const user = cmbot.users[userid];
    if (user && !user.afk) {
      return total + 1;
    }
    return total;
  }, 0);
};

ttqueue.prototype.getQueue = function () {
  this.prune();
  return this.queueArray;
};

ttqueue.prototype.moveUser = function (oldPosition, newPosition) {
  this.queueArray.move(oldPosition, newPosition);
  this.saveQueue();
};

ttqueue.prototype.prune = function () {
  var cmbot = this.cmbot;
  // filter out any user in the queue that is not in cmbot.user
  this.queueArray = this.queueArray.filter(userid => !!cmbot.users[userid]);
};

ttqueue.prototype.clearQueue = function () {
  this.queueArray = [];
};

Array.prototype.move = function (old_index, new_index) {
  if (new_index >= this.length) {
    var k = new_index - this.length;
    while (k-- + 1) {
      this.push(undefined);
    }
  }
  this.splice(new_index, 0, this.splice(old_index, 1)[0]);
  return this; // for testing purposes
};

module.exports = ttqueue;
