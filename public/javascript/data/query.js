function generateSelectDropdown(){
  var
    tier,
    properties = function(d){ return d; },
    click = function(){ throw 'no click function'},
    change = function() { throw 'no onChange function'},
    path = null
    ;
  function query(){
    return tier;
  }
  query.reactprops = function(_){
    if(!arguments.length) return properties;
    properties = _;
    return query;
  };
  query.click = function(_){
    if(!arguments.length) return click;
    click = _;
    return query;
  };
  query.onchange = function(_){
    if(!arguments.length) return change;
    change = _;
    return query;
  };
  query.ws = function(_) {
    if(!arguments.length) return path;
    path = _;
    return query;
  };
  return query;
}