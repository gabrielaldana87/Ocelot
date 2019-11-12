var settings = settings;
callModule({
  selection:'div#root',
  partial:'#container-gist'
}, 'modules', config => { if(!config.visualize) return;
  getData(config)
    .then(results => { writeToBrowser(`getData returns ${config.name}`);
      var
        array = Array.isArray(results),
        results = array ? {elements:results} : results,
        keys = array ? ['elements'] : config.visualize.accessors.raw.split('|'),
        summary = config.visualize.accessors.summary,
        helper = config.visualize.accessors.helper
        ;
      config.visualize.data = keys.length > 1 ? results[keys[0]][keys[1]] : results[keys[0]];
      config.visualize.summary = helper ? helper(results[summary]) : results[summary];
      return parseData(config);
    })
    .then(results => { writeToBrowser(`parseData returns ${config.name}`);
      config.visualize.data = results;
      return resizeSvg(config);
    })
    .then(svg => { writeToBrowser(`resizeSVG returns ${config.name}`);
      config.visualize.svg.width = svg.attr('width');
      config.visualize.svg.height = svg.attr('height');
      return callChart(config);
    })
    .then(chart => { writeToBrowser(`callChart returns ${config.name}`);
      chart
        .xScale( x => { config.visualize.domain = { x: x.domain() }; })
        .yScale( y => { config.visualize.domain.y = y.domain(); });
      return addInteraction(config);
    })
    .then(zoom => { writeToBrowser(`zoomChart returns ${config.name}`);
      zoom
        .config(settings.modules);
      return addCursor(config);
    })
    .then(cursor => { writeToBrowser(`addCursor returns ${config.name}`);
      cursor
        .config(config)
        .modules(settings.modules);
      return createPills(config);
    })
    .then(pills => { writeToBrowser(`createPills returns ${config.name}`);
      return createSymbol(config);
    })
    .then(config => { writeToBrowser(`symbol Written ${config.name}`);
      return resizeWindow(config);
    })
    .then(config => { writeToBrowser(`window Resized ${config.name}`);
      return attachPanel(config);
    })
    .then(config => { writeToBrowser(`dropdown Attached ${config.name}`);
      return attachSearchDropdown(config);
    })
    .then(config => { writeToBrowser(`calling WebService ${config.name}`);
      return createSourceButton(config);
    })
    .fail(e => {
      e.config.visualize.domain = {
        x: [new Date(), new Date()],
        y: [0,0]
      }
    });
});

function writeToBrowser(string) {
  return console.log(string);
}

function callModule(config,key,completion){

  d3.select(config.selection)
    .selectAll('.gist')
    .data(settings[key])
    .enter()
    .append('div')
    .classed('gist',true)
    .html(render)
    .each( d => { completion(d); })
    .style('display', d => !d.visible ? null : d.visible);

  function render( d,i ){
    var template = Handlebars.compile( d3.select(config.partial).html() );
    return template(d);
  }

}

function resizeSvg(config){
  var
    body =  d3.select('.' + config.class).node().parentNode,
    width = body.getBoundingClientRect().width
    ;
  return d3.select('.' + config.class).attr('width',width);
}

function resizeWindow(config){

  d3.selectAll('svg.view')
    .call(resize);

  function resize(selection){
    var
      svg = selection;
    d3.select(window).on('resize', () => {
      svg.each(function(){
        let
          parent = this.parentNode,
          width = parent.getBoundingClientRect().width,
          meds = select => {
            return d3.select(select)
              .attr('width', width - 175)
              .selectAll('.meds')
              .attr('width', width);
          };
        d3.select(parent).selectAll('svg')
          .select( d => {
            const tag = d3.select(this).attr('class');
            if(tag == 'cat'){ meds(this);}
            else return this
          })
          .attr('width', width - 35);
      });
    });
  }
  return config;
}

function getData(config){

  var
    deferred = Q.defer(),
    path = config.visualize.ws.path
    ;
  d3.request(path)
    .on('error', error => callback(error) )
    .get((d,e) => {
      try{
        loadEvent(d);
        deferred.resolve(dataResponse(e));
      } catch(error){
        deferred.reject(errorView(config, function(){
          return {
            error: 'Web Service or File does not Exist',
            config: config
          }
        }));
      }
    });
  return deferred.promise;
}

const logURL = path => {
  let
    dt = path.replace(/\".*/,''),
    parse = moment(dt, 'D/MMM/YYYY:HH:mm:ss'),
    localDt = new Date(parse.utc('-0500')),
    ws = '//localhost:8080/json',
    url = path.replace(/^.+\?/, '').replace(/\s.*/,''),
    val = url.replace(/\&/g,'","'),
    stringify = val.replace(/\=/g,'":"'),
    obj = `{"${stringify}","ts":${localDt}}`
    ;
  d3.request(ws)
    .header('Content-Type', 'application/json')
    .post(obj, (d,e) => {
      console.log(d,e);
    });
  return JSON.parse(obj);
};

function fireEvent(module, element, action, value) {
  let
    loggerUrl = '/clicklog',
    parameters = '',
    options = {},
    url = window.location.href.replace(/^.+\?/, '?')
    ;
  options.module = module;
  options.element = element;
  options.action = action;
  options.value = value;
  for(var i in options){
    if(options.hasOwnProperty(i)){
      // let amp = (i === 'module') ? '' : '&';
      parameters += `&${i}=${encodeURIComponent(options[i])}`;
    }
  }
  new Image().src = loggerUrl + url + parameters;
}

function loadEvent(d){
  if(d){
    throw 'Web Service or File does not exist';
  }
}

function errorView(config, completion){
  var
    container = d3.select('.' + config.class)
      .node().parentNode.parentNode
    ;
  d3.select(container)
    .style('display','none');
  return completion();
}

function dataResponse(e){
  var
    data = JSON.parse(e.response);
  return data;
}

function parseData(config){
  if(!config.visualize) return config;
  try{
    var
      parse = config.visualize.parse();
    return parse;
  } catch(error){
    errorView(config, function(){
      throw {
        error: 'Data contains empty array',
        config: config
      }
    });
  }
}

function callChart(config){
  if(!config.visualize) return config;
  var
    graph = config.visualize.chart()
    ;
  d3.select('svg.' + config.class)
    .datum(config.visualize.data)
    .call(graph)
  ;
  return graph;
}

function createPills(config){
  if(!config.visualize.pills) return;
  var
    that = d3.select('.' + config.class),
    w = that.node().parentNode.getBoundingClientRect().width,
    pills = config.visualize.pills(),
    maxDt = config.visualize.panel().getmaxdt(),
    zoomed = config.visualize.zoom(),
    zScale = d3.scaleOrdinal(pills.colors()),
    fScale = d3.scaleOrdinal(pills.fontColor()),
    props  = pills.reactprops(),
    parent = d3.select('.' + config.class).node().parentNode
    ;
  d3.select(parent).selectAll('.tabs-left div').each(function(){
    let
      id = d3.select(this).attr('id'),
      domContainer = this;
    if(id === 'buttons'){
      let
        remove = pills.onRemove(),
        onClick = pills.click();
      props.removeRenderer = (value, status) => {
        let state = status ? 'remove' : 'add';
        fireEvent(config.class, 'pill', state, value);
        remove(value, that, status)
      };
      props.onValueClick = (value, status) => {
        fireEvent(config.class, 'pill', 'click', value);
        onClick(value, that, status)
      };
      props.colorRenderer = d => zScale(d);
      ReactDOM.render(React.createElement(GenerateButton, props), domContainer);
    }
  });
  d3.select(parent).selectAll('.tabs-left div#times').each(function(){
    let
      xScale = d3.scaleTime(),
      times = config.visualize.times(),
      props = times.reactprops(),
      onclick = times.click(),
      onchange = times.onchange(),
      zoom = d3.zoom().on('zoom', zoomed.config(settings.modules))
      ;
    props.onValueClick = (value) => { onclick(value); };
    props.onChange = (timeObj) => {
      let
        now = new Date(),
        last24 = d3.timeHour.offset(now, -24),
        lastDt = maxDt(),
        pastDt = d3.timeHour.offset(lastDt, -timeObj.value),
        newDt = d3.timeHour.offset(now, -timeObj.value)
        ;

      d3.selectAll('div#times .Select-value a.Select-value-label')
        .text(timeObj.period)
      ;
      xScale
        .range([0, w - 80])
        .domain([last24, now])
      ;
      that
        .call(zoom)
        .transition()
        .duration(1000)
        .call(zoom.transform, d3.zoomIdentity
            .scale((w - 80) / (xScale(now) - xScale(newDt)))
            .translate(-xScale(d3.timeHour.offset( now.getTime(), -timeObj.value)), 0)
        )
      ;
      fireEvent(config.class, 'dropdown', 'selection', timeObj.value)
      ;
      passDomain(config, [newDt, now])
      ;
    };
    ReactDOM.render(React.createElement(Contributors, props), this);
  });

  function passDomain (config, x) {
    if(config.visualize.activation) {
      let
        view = d3.select('.' + config.class),
        update = config.visualize.update(),
        key = update.visualize.accessors.raw,
        path = update.visualize.ws.path,
        formatDt = d3.timeFormat('%Y/%m/%d %H:%m:%S'),
        str_end = /(?<=end=).+?[^&]+/,
        str_str = /(?<=start=).+?[^&]+/,
        start_tm = x[0],
        end_tm = x[1],
        machine_update = path.replace(str_end, formatDt(end_tm)).replace(str_str, formatDt(start_tm))
        ;
      update.visualize.ws.path = machine_update;
      return getData({visualize:{ws:{path: machine_update}}})
        .then(results => {
          let domain = [d3.min(results, o => o['ts']), d3.max(results, o => o['ts'])];
          update.visualize.data = key ? results[key] : results;
          updateLineInterpolationText(view, results.length, domain);
          fireEvent(config.class, 'toggle', 'click', config.visualize.activation);
          return parseData(update);
        })
        .then(results => {
          update.visualize.data = results;
          return callChart(update)
            .xDomain([start_tm , end_tm])
        });
    }
  }
  zScale.domain(config.visualize.pills())
  ;
  return pills;
}

function replacePills(config) {
  let
    li = [],
    that = d3.select(`.${config.class}`),
    parent = that.node().parentNode,
    pills = config.visualize.pills(),
    cells = _.difference(Object.keys(config.visualize.data[0]), ['startdtm', 'enddtm', 'w']).sort(),
    dropdown = cells.forEach(el => li.push({label: el, value: el})),
    zScale = d3.scaleOrdinal([]),
    props = {path: li, valueKey: 'value'}
    // props  = pills.reactprops()
    ;
  d3.select(parent).selectAll('.tabs-left div#buttons').each((d,i,t) => {
    let
      domContainer = t[i],
      onclick = pills.click(),
      onchange = pills.onRemove()
      ;
    props.onValueClick = (value, status) => onclick(value, that, status);
    props.onChange = (value, status) => onchange(value, that, true);
    // props.colorRenderer = d => zScale(d);
    //TODO: Works to update the pills with component fluids
    //ReactDOM.render(React.createElement(App, props), domContainer)
    //TODO: This code works to update pills with dropdown list instead
    //ReactDOM.render(React.createElement(Contributors, props), domContainer)
  })
}

function createSourceButton(config) {
  if (!config.visualize.toggle) return config;
  let
    parent = d3.select(`.${config.class}`).node().parentNode,
    toggle = config.visualize.toggle(),
    props = toggle.reactprops(),
    domContainer = d3.select(parent).select('.tabs-left div#source').node(),
    path = toggle.ws(),
    now = new Date(),
    hier = d3.timeHour.offset(now, -24),
    formatDt = d3.timeFormat('%Y/%m/%d %H:%m:%S'),
    href = window.location.href,
    url = href.replace(/^.+\?/, '').replace(/\s.*/,''),
    val = url.replace(/\&/g,'","'),
    stringify = val.replace(/\=/g,'":"'),
    obj =`{"${stringify}"}`,
    parsed = JSON.parse(obj),
    start = `&start=${formatDt(hier)}`,
    end = `&end=${formatDt(now)}`,
    mrn = `&mrn=${parseInt(parsed['m'])}`,
    facility_id = `&facility_id=${parsed['f']}`,
    api = `${path}${end}${facility_id}${mrn}${start}`
    ;
  if(config.class === 'vitalsigns') {
    getData({visualize: {ws: {path: api}}})
      .then(results => {
        if(results) { return config; }
        else
          props.onToggle = checked => swapData(config, checked);
        ReactDOM.render(React.createElement(Toggle, props), domContainer);
        return config;
      });
  }
  // else
  // props.onToggle = checked => swapData(config, checked);
  // ReactDOM.render(React.createElement(Toggle, props), domContainer);
  // return config;
}

function addInteraction(config) {
  if(!config.visualize.zoom) return config;
  var
    zoomed = config.visualize.zoom(),
    zoom = d3.zoom().on('zoom', zoomed)
    ;
  d3.select('svg.' + config.class)
    .call(zoom)
  ;
  d3.selectAll('.svg-vitals')
    .select('.axis.axis--x')
    .remove()
  ;
  return zoomed;
}

function swapData(config, checked) {
  if(!config.visualize.update) return config;
  let
    view = d3.select('.' + config.class),
    update = config.visualize.update(),
    key = update.visualize.accessors.raw
    ;
  config['visualize']['activation'] = checked;
  getData(update)
    .then(results => {
      let domain = [d3.min(results, o => o['ts']), d3.max(results, o => o['ts'])];
      update.visualize.data = key ? results[key] : results;
      updateLineInterpolationText(view, results.length, domain);
      fireEvent(config.class, 'toggle', 'click', checked);
      return parseData(update);
    })
    .then(results => {
      update.visualize.data = results;
      removeArtifactText(config, checked);
      if(checked){ return callChart(update)}
      else update.visualize.data = config.visualize.data;
      return callChart(update);
    })
    .then(chart => {
      return addInteraction(update);
    })
    .then(zoom => {
      return replacePills(update);
    })
  ;
  return config;
}

function removeArtifactText (config, checked) {
  let
    value = checked ? null : 'none',
    selection = d3.select(`.${config.class}`),
    parent = d3.select('.' + config.class).node().parentNode
    ;
  selection.select('.sampling-txt').attr('display', value);
  d3.select(parent).selectAll('.nest text').attr('display', 'none');
}

function updateLineInterpolationText (selection, l, domain) {
  let
    agg_txt = `aggregated median`,
    t0 = new Date(+domain[0] * 1000),
    t1  = new Date(+domain[1] * 1000),
    tx = d3.timeMinute.count(t0, t1),
    val = tx <= 1440 ? '' : agg_txt,
    f = Math.round(d3.timeMinute.count(t0, t1) / l),
    s = f > 1 ? 's' : '',
    min_txt = `line displaying ${val} value at every ${f} minute${s} (${l} points)`,
    tl = f > 1 ? -100 : 0
    ;
  selection.select('.sampling-txt')
    .attr('x',`${tl}`)
    .text(min_txt)
  ;
}

function addCursor(config) {
  if(!config.visualize.cursor) return config;
  var cursor = config.visualize.cursor();
  d3.select('svg.' + config.class)
    .call(cursor);
  // d3.selectAll('.svg-vitals').call(cursor);
  return cursor;
}

function createSymbol(config){
  var
    current = d3.select('svg.' + config.class),
    sibling = current.select(function(){ return this.parentNode.parentNode.parentNode; }).select('.triangle-back'),
    arc = d3.symbol().type(d3.symbolTriangle).size(100)
    ;
  sibling
    .selectAll('.triangle')
    .data([{}])
    .enter()
    .append('path')
    .attr('opacity',0)
    .attr('class','triangle expand')
    .attr('d', arc )
    .attr('stroke-width',1)
    .attr('transform','translate(10,10) rotate(60)')
    .transition()
    .duration(500)
    .attr('opacity',1);

  sibling.on('click',() => {
    transitionSelectionList(config);
  });

  return config;
}

function rotateTriangle(selection,angle){
  selection.transition()
    .duration(1000)
    .attr('transform','rotate(' + angle + ')');
}

function returnState(status) {
  if(status) {
    return 'collapsed';
  } else return 'expanded';
}

function transitionSelectionList(config){
  var
    deriveParent = function(){ return this.parentNode },
    current = d3.select('svg.' + config.class),
    parent = current.select(deriveParent),
    height = parent.node().getBoundingClientRect().height,
    svg = current.select(deriveParent).selectAll('svg'),
    sibling = current.select(function(){ return this.parentNode.parentNode.parentNode; }).select('.triangle-back'),
    state = true
    ;
  current.select(deriveParent).select(deriveParent).select(deriveParent)
    .style('margin-bottom','0px');
  parent
    .transition()
    .duration(750)
    .style('opacity',0)
    .style('height','0px');
  current.select(function(){ return this.parentNode.parentNode; }).select('.accordion-panel')
    .style('min-height',null)
    .transition()
    .duration(750)
    .style('opacity',0)
    .style('height','0px');
  sibling
    .on('click',() => {
      if(state){
        current.select(deriveParent).select(deriveParent).select(deriveParent)
          .style('margin-bottom','7px');
        current.select(deriveParent)
          .transition()
          .duration(750)
          .style('opacity',1)
          .style('height',null);
        current.select(function(){ return this.parentNode.parentNode; }).select('.accordion-panel')
          .style('min-height',null)
          .transition()
          .duration(750)
          .style('opacity',1)
          .style('height', `${height}px`);
        rotateTriangle(sibling,360);
        state = false;
        fireEvent(config.class, 'triangle-down', 'click', returnState(state));
      } else transitionSelectionList(config);
    });
  rotateTriangle(sibling,150);
  fireEvent(config.class, 'triangle-down', 'click', returnState(state));
}

function attachPanel(config){
  if(!config.visualize.panel) return config;
  let
    that = d3.select('.' + config.class),
    body = that.node().parentNode,
    sibling = body.nextElementSibling,
    panel = config.visualize.panel(),
    props = panel.reactprops(),
    height = body.getBoundingClientRect().height
    ;
  d3.select(sibling).style('height', height + 'px' );
  //TODO: check if this visually breaks the symmetry of right and left panel


  if(config.class !== 'prescriptions'){
    let
      domContainer = sibling,
      properties = {
        arrows:[{id:'Back',style:{transform:'rotate(90deg)',width: '22em', padding:'1px 1px 1px 1px'},movement:1,
        },{id:'Forward',style:{transform:'rotate(270deg)',width: '22em', padding:'1px 2px 1px 1px'}, movement:-1}],
        headers: config.visualize.headers,
        path: props('default').path || null,
        period: 24,
        times:['Filler','Yesterday','Today'].map( e => {
          return {
            id: e,
            functionId: props(e).functionId || null
          }
        }),
        measures: config.visualize.measures().map( e => {
          return {
            id: e,
            functionId: props(e).functionId || null
          }
        })
      };
    ReactDOM.render(React.createElement(RightPanel, properties), domContainer);
  }
  return config;
}

function attachSearchDropdown(config) {
  if(!config.visualize.search) return config;
  let
    search = config.visualize.search(),
    props = search.reactprops() || {},
    onclick = search.click() || null,
    onchange = search.onchange() || null,
    parent = d3.select('.prescriptions').node().parentNode.parentNode,
    domContainer = d3.select(parent).select('.accordion-panel').node()
    ;
  props.onValueClick = (value) => { onclick(value); };
  props.onChange = (value) => { onchange(value); };
  ReactDOM.render(React.createElement(Contributors, props), domContainer);
  return config;
}
