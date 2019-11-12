function generateControlPanel(){
  var
    tier,
    properties = function(d){ return d; },
    nesting = function(){ },
    click = function(){ },
    value = function(d){ return d; },
    maxDate = function() { throw 'no date'}
    ;
  function panel(){
    return tier;
  }
  panel.tier1 = function(_){
    if(!arguments.length) return tier;
    tier = _;
    return panel
  };
  panel.reactprops = function(_){
    if(!arguments.length) return properties;
    properties = _;
    return panel;
  };
  panel.click = function(_){
    if(!arguments.length) return click;
    click = _;
    return panel;
  };
  panel.unwrap = function(_){
    if(!arguments.length) return nesting;
    nesting = _;
    return panel;
  };
  panel.value = function(_){
    if(!arguments.length) return value;
    value = _;
    return panel;
  };
  panel.getmaxdt = function(_){
    if(!arguments.length) return maxDate;
    maxDate = _;
    return panel;
  };
  return panel;
}