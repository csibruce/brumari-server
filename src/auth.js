var auth = require('basic-auth');

var admins = {
  'brumari': { password: 'brumariserver' },
};


module.exports = function(req, res, next) {
  var user = auth(req);
  console.log({ user });
  if (!user || !admins[user.name] || admins[user.name].password !== user.pass) {
    res.set('WWW-Authenticate', 'Basic realm="bruce"');
    return res.status(401).send();
  }
  return next();
};
