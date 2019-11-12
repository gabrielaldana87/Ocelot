var path = require('path');
var hbs = require('hbs');
var fs = require('fs');

hbs.registerPartials(path.join(__dirname, '/views/partials/containers'));
hbs.registerPartials(path.join(__dirname, '/views/partials/custom'));

hbs.registerHelper('json', function(context) {
  return JSON.stringify(context);
});


