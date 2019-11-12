(function() {
  var reduce = this.reduce = {};

  reduce.removeNulls = function (o){
    var clone = o;
    _.each(clone, function(v,k){
      if(!v){
        delete clone[k];
      }
    });
    return clone;
  };

  reduce.largestObject = function(o){
    return _.sortBy(o,function(k){ return Object.keys(k).length}).reverse();
  };

  reduce.extractAllKeys = function(array){
    return _.chain(array).map(_.keys).flatten().unique().value();
  };

  reduce.filterDropdown = function(fullData,key,inputValue){
    //filter for a particular key based on input value
    return _.filter(fullData, function(o){
      return o[key]===inputValue;
    });
  };

  reduce.sortKeysBy = function(obj, comparator){
    var keys = _.sortBy(_.keys(obj), function (key) {
      return comparator ? comparator(obj[key], key) : key;
    });

    return _.object(keys, _.map(keys, function (key) {
      return obj[key];
    }));
  };

  reduce.checkForObject = function(a){
    if(_.isArray(a)){
      return a;
    }
    else if(_.isObject(a)){
      return [a];
    }
  };

  _.mixin(reduce);

})();