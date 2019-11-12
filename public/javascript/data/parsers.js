function parseVitals(){
  var
    data = [],
    datetime = new Date(),
    reject = [],
    value = function(d) { return d;},
    summary
    ;
  function parse(data){
    let
      total_keys = _.map(data, (d,i)  => Object.keys(d).length),
      max = _.max(total_keys),
      largest = _.findIndex(total_keys, d =>  d == max),
      obj = d3.map(data[largest]).keys(),
      keys = _.without.apply(_,[obj].concat(reject)).sort(),
      arrange = keys.map(function(id){
        return {
          id:id,
          values: data.map(function(d){
            var
              sign = d[id] ? +value(d[id]): null,
              parsed_dt = datetime(d)
              ;
            return {date: parsed_dt, value: sign};
          })
        };
      });
    emptyObject(data);
    return arrange;
  }

  function removeNullValueObj(data) {
    return _.each(data,function(o){return _.removeNulls(o);});
  }

  function emptyObject(array){
    if(!array.length){
      throw 'Data Object is Empty';
    }
  }

  parse.rejectKeys = function(_){
    if(!arguments.length) return reject;
    reject = _;
    return parse;
  };
  parse.data = function(_){
    if(!arguments.length) return data;
    data = _;
    return parse(data);
  };
  parse.convertDt = function(_){
    if(!arguments.length) return date;
    datetime = _;
    return parse;
  };
  parse.trimUOM = function(strip,inject){
    if(!arguments.length) return value;
    value = function(d){
      return d.replace(strip, inject)
    };
    return parse;
  };
  parse.summary = function(_){
    if(!arguments.length) return summary;
    summary = _();
    return parse;
  };
  parse.dataAccessor = function(_){
    if(!arguments.length) return null;

  };

  return parse;
}

function parseIO() {

  var
    data = [],
    period = '1'
    ;

  function parse(data) {
    //console.log(data);
    var
      iot = data,
      intervals = [],
      details = [],
      detail = {},
      parse_temp = [],
      parsed = [],
      keys = {},
      allkeys = []
      ;
    if(iot && iot.intervals) {
      intervals = iot.intervals.interval || [];

      // loop each dataset
      for(var i in intervals) {
        if(!intervals[i].details) continue;
        details = _.checkForObject(intervals[i].details.item) || [];
        detail = {
          "startdtm": intervals[i].startdtm,
          "enddtm": intervals[i].enddtm
        };
        for(var j in details) {
          // store unique keys for future
          keys[details[j].description] = null;
          detail[details[j].description] = details[j].netvalue;
        }
        // save temporary data
        if(details[j].w === period || details[j].w === parseInt(period)) {
          parse_temp.push(detail);
        }
      }
    }

    if(intervals.length > 0) {
      // get array of data keys
      allkeys = Object.keys(keys);

      for(var p in parse_temp) {
        //rebuild the data including all keys (set to null where missing from input)
        detail = {
          "startdtm": parse_temp[p].startdtm,
          "enddtm": parse_temp[p].enddtm
        };
        for(var k in allkeys) {
          var currentkey = allkeys[k];
          detail[currentkey] = +parse_temp[p][currentkey] || null;
        }
        parsed.push(detail);
      }
    }
    //console.log(intervals.length);
    return parsed;
  }
  parse.data = function(_){
    if(!arguments.length) return data;
    data = _;
    return parse(data);
  };
  parse.interval = function(_){
    if(!arguments.length) return period;
    period = _;
    return parse;
  };
  return parse;
}

function parseInsOutsNet(){
  var
    data = [],
    period = '1',
    next = function(){}
    ;

  function parse(data) {
    var
      iot = data,
      intervals = [],
      detail = {},
      parsed = []
      ;
    if(iot && iot.intervals){
      intervals = iot.intervals.interval || [];
      //loop each dataset
      for(var i in intervals) {
        detail = {
          'w': intervals[i].w,
          'startdtm': intervals[i].startdtm,
          'enddtm': intervals[i].enddtm,
          'in': intervals[i].in,
          'out': -intervals[i].out,
          'net': intervals[i].net
        };
        parsed.push(detail);
      }
    }
    return parsed;
  }
  parse.data = function(_){
    if(!arguments.length) return data;
    data = _;
    return parse(data);
  };
  parse.filter = function(_){
    if(!arguments.length) return data;
    next = _;
    return parse;
  };
  return parse;
}

function parseDrips(){
  var
    data,
    detail = {},
    obj = {},
    set = []
    ;
  function parse(data){
    var
      data = Array.isArray(data) ? data : [data]
      ;
    data.forEach( o => {
      let intervals = Array.isArray(o.doses.admin) ? o.doses.admin : [o.doses.admin];
      let parsed = [];
      let defineTime = i => {
        if(intervals[i - 1] !== undefined){
          return d3.timeHour.count(new Date(intervals[i - 1].recordeddtm), new Date(intervals[i].recordeddtm));
        }
      };
      for (var i in intervals) {
        detail = {
          'dose': intervals[i].dose,
          'doseunit': intervals[i].doseunit,
          'recordeddtm': new Date(intervals[i].recordeddtm),
          'recordedendtm': d3.timeHour.offset(new Date(intervals[i].recordeddtm),1),
          'interval': i > 0 ? defineTime(i) : null,
          'maxdosage': d3.max(intervals, e => { return e.dose; })
        };
        parsed.push(detail);
      }
      obj = {
        'itemname': o.itemname,
        'rank':o.rank,
        'c1':o.c1 ? o.c1 : 'not classified',
        'c2':o.c2 ? o.c2 : 'not classified',
        'cfinal':o.cfinal ? o.cfinal : 'not classified',
        'doses': {'admin': parsed}
      };
      return set.push(obj);
    });
    return set;
  }
  parse.data = function(_){
    if(!arguments.length) return data;
    data = _;
    return parse(data);
  };
  return parse;
}

function parseMeds(){
  var
    data,
    detail = {},
    obj = {},
    set = []
    ;
  function parse(data){

    data.forEach( o => {
      let intervals = Array.isArray(o.tasks.task) ? o.tasks.task : [o.tasks.task];
      let parsed = [];
      for (var i in intervals) {
        detail = {
          'taskstatus': intervals[i].taskstatus,
          'uom': intervals[i].uom,
          'route': intervals[i].route,
          'orderdose': intervals[i].orderdose,
          'scheduleddtm': intervals[i].scheduleddtm || null,
          'prn': intervals[i].prn,
          'frequency': intervals[i].frequency,
          'dosepctile': intervals[i].dosepctile,
          'performeddtm': new Date(intervals[i].performeddtm),
          'performedendtm': d3.timeMinute.offset(new Date(intervals[i].performeddtm),3)
        };
        parsed.push(detail);
      }
      obj = {
        'c1': o.c1 ? o.c1 : 'not classified',
        'c2': o.c2 ? o.c2 : 'not classified',
        'c3': o.c3 ? o.c3 : 'not classified',
        'cfinal': o.cfinal,
        'drugname': o.drugname,
        'orderstatus': o.orderstatus,
        'rank': o.rank,
        'tasks': {'task': parsed}
      };
      return set.push(obj);
    });
    return set;
  }
  parse.data = function(_){
    if(!arguments.length) return data;
    data = _;
    return parse(data);
  };
  return parse;
}

function parseDeterioration(){
  var
    data,
    next = function(){}
    ;
  function parse(data){
    return data;
  }
  parse.data = function(_){
    if(!arguments.length) return data;
    data = _;
    return parse(data);
  };
  parse.filter = function(_){
    if(!arguments.length) return data;
    next = _;
    return parse;
  };
  return parse;
}

function parseLabs() {
  let
    data = [],
    reject = []
    ;
  function parse(data) {
    let
      labs = data,
      panels = [],
      total_keys,
      reduce,
      distinct
      ;
    if(labs && labs.panels){
      panels = labs.panels.panel;
      total_keys = _.map(panels, (d,i) => _.without.apply(_,[Object.keys(d)].concat(reject)) );
      reduce = _.reduceRight(total_keys, (a,b) => a.concat(b), []);
      distinct = _.uniq(reduce);

      console.log(distinct)
    }

  }
  parse.data = function(_) {
    if(!arguments.length) return data;
    data = _;
    return parse(data);
  }
  ;
  parse.rejectKeys = function(_){
    if(!arguments.length) return reject;
    reject = _;
    return parse;
  }
  ;
  return parse;
}