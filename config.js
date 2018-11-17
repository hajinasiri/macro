var config = {
  //verificationURL: 'https://get-started-genealogy.c9users.io/users/email-verification/${URL}',
  verificationURL: 'https://macro.systemsagency.org/users/email-verification/${URL}',
  //"from": 'Do Not Reply <info@ourfathers.com>'
  from: 'Do Not Reply <info@systemsagency.org>',
};

// config.mongoUri = 'mongodb://noder:sportt1@localhost:27017/sm';
config.mongoUri = 'mongodb://localhost:27017/sm';
config.cookieMaxAge = 30 * 24 * 3600 * 1000;
config.port = "3200";
config.admin = "larrym14@gmail.com";
module.exports = config;