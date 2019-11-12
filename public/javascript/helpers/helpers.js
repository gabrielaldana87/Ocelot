Handlebars.registerHelper('exists', function(context) {
  if(typeof context === 'function'){
    return 3;
  } else return 12;
});

Handlebars.registerHelper('minus', function(context) {
  if(typeof context === 'function'){
    return 9;
  } else return 12;
});

Handlebars.registerHelper('partition', function(context, percentage) {
  return 'width:' + percentage/context + '%';
});

Handlebars.registerHelper('bp_proxies', function(context) {
  if(context === 'bp'){
    return new Handlebars.SafeString('<div class="first" id="sbp"></div><div class="second" id="dbp"></div>');
  }
  if(context === 'abp'){
    return new Handlebars.SafeString('<div class="first" id="sbp_art"></div><div class="second" id="dbp_art"></div>');
  }
});

Handlebars.registerHelper('capitalize',function(context){
  return context.toUpperCase();
});