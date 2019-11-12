var settings = {
  modules : [
    {
      name:'Vital Signs',
      class: 'vitalsigns',
      shapes:'circle',
      col:12,
      svg:{
        width:500,
        height:250
      },
      visualize:{
        ws:{
          path:'vitals.json'
        },
        svg:{
          width:null,
          height:null
        },
        headers: ['measure','range','current'],
        measures: function(){ return _.uniq(this['data'].map(k => {
          if(k['id'] === 'dbp' || k['id'] === 'sbp') return 'bp';
          if(k['id'] === 'dbp_art' || k['id'] === 'sbp_art') return 'abp';
          else return k['id'];
        }))},
        accessors:{
          raw: 'rawvitals|timepoint',
          summary: ['summaryvitals'],
          nest:'days|day'
        },
        summarykeys: function(){
          return {
            hr:{min:'HRMin',max:'HRMax'},
            abp:{min_d:'DBPMin_art',max_d:'DBPMax_art',min:'SBPMin_art',max:'SBPMax_art'},
            spo2:{min:'SpO2Min',max:'SpO2Max'},
            bp:{min_d: 'DBPMin',max_d:'DBPMax',min:'SBPMin',max:'SBPMax'},
            tc:{min: 'TCMin',max:'TCMax'},
            weight:{min: 'weightMin',max: 'weightMax'},
            rr: {min:'RRMin',max:'RRMax'}
          }
        },
        parse: function(){
          var
            formatDate = d3.timeParse('%d %b%H:%M %Y'),
            data = this['data'],
            parse = parseVitals()
              .rejectKeys(['minutesago','date','time','weight','cvp','tf'])
              .convertDt(d => formatDate(d['date'] + d['time'] + ' 2019'))
              // .rejectKeys(['bed', 'facility_id', 'minutes','unit','ts','abpm','nbpm'])
              // .convertDt(function(d){ return new Date(+d['ts'])})
              // .trimUOM(/[^0-9$.,]/g, '' )
              .data(data);
          return parse;
        },
        pills: function(){
          var
            that = this,
            signs = _.uniq(that['data'].map(k => {
              if(k['id'] === 'dbp' || k['id'] === 'sbp') return 'bp';
              if(k['id'] === 'dbp_art' || k['id'] === 'sbp_art') return 'abp';
              else return k['id'];
            })),
            margin = {top: 20, right: 50, bottom: 20, left: 30},
            scheme = ['#6495ed','#f39c12','#ffc0cb','#1abc9c','crimson','steelblue','#3cb371'],//d3.schemeCategory20,
            height = this.svg.height - margin.top - margin.bottom,
            width = this.svg.width - margin.left - margin.right,
            xDomain = this.domain.x,
            yDomain = this.domain.y,
            data = signs,
            keys = reduceToKeys()
              .colors(scheme)
              .padding('2px 10px 2px 10px')
              .fontColor(['white','white','black','white','white','white'])
              .elementClassName('line')
              .reactprops({path: data, removeRenderer: null, onToggle: null})
              .click((value,parent,status) => {
                let
                  filterNotButton = d => {
                    if(value === 'bp') { return d.id !== 'sbp' && d.id !== 'dbp' && d.id !== 'bp';}
                    else if(value === 'abp') { return d.id !== 'sbp_art' && d.id !== 'dbp_art' && d.id !== 'abp' }
                    else return d.id !== value
                  },
                  filterForButton = d => {
                    if(value === 'bp') { return d.id === 'sbp' || d.id === 'dbp' || d.id === 'bp';}
                    else if(value === 'abp') { return d.id === 'sbp_art' || d.id === 'dbp_art' || d.id === 'abp' }
                    else return d.id === value
                  },
                  toggle = onValueClick()
                    .config(that)
                    .w(width)
                    .h(height)
                    .x(d => new Date(d['date']))
                    .y(d => d['value'])
                    .y0(d => d['y0'])
                    .y1(d => d['y1'])
                    .xDomain(xDomain)
                    .yDomain(yDomain)
                    .xRange([0,width])
                    .yRange([height,0])
                    .filterIndividualValue(filterForButton)
                    .filteredYDomain(filterNotButton)
                    .visibility(0)
                    .singularFilter('execute!')
                  ;
                return toggle(parent, value, status);
              })
              .onRemove((value, parent, status) => {
                let
                  filterNotButton = d => {
                    if(value === 'bp') { return d.id !== 'sbp' && d.id !== 'dbp' && d.id !== 'bp';}
                    else if(value === 'abp') { return d.id !== 'sbp_art' && d.id !== 'dbp_art' && d.id !== 'abp' }
                    else return d.id !== value
                  },
                  filterForButton = d => {
                    if(value === 'bp') { return d.id === 'sbp' || d.id === 'dbp' || d.id === 'bp';}
                    else if(value === 'abp') { return d.id === 'sbp_art' || d.id === 'dbp_art' || d.id === 'abp' }
                    else return d.id === value
                  },
                  remove = onValueClick()
                    .config(that)
                    .w(width)
                    .h(height)
                    .x(d => new Date(d['date']))
                    .y(d => d['value'])
                    .y0(d => d['y0'])
                    .y1(d => d['y1'])
                    .xDomain(xDomain)
                    .yDomain(yDomain)
                    .xRange([0,width])
                    .yRange([height,0])
                    .filterIndividualValue(filterForButton)
                    .filteredYDomain(filterNotButton)
                    .visibility(0)
                  ;
                return remove(parent, value, status);
              });
          return keys;
        },
        chart: function(){
          var
            data = this['data'],
            chart = multiLineTimeSeries()
              .x(d => new Date(d['date']))
              .y(d => d['value'])
              .y1(d => d['y1'])
              .y0(d => d['y0'])
              .xDomain([d3.timeHour.offset(new Date(),-24), new Date()])
              // .xDomain([
              //   d3.timeHour.offset(d3.max(data, c => d3.max(c['values'], d => new Date(d['date']))), -24),
              //   d3.max(data, c => d3.max(c['values'], d => new Date(d['date'])))
              // ])
              .yDomain([
                d3.min(data, c => d3.min(c['values'], d => d['value'])),
                d3.max(data, c => d3.max(c['values'], d => d['value']))
              ])
              .w(+this['svg']['width'])
              .h(+this['svg']['height']);
          return chart;
        },
        zoom: function(){
          var
            xDomain = this['domain']['x'],
            yDomain = this['domain']['y'],
            w = this.svg.width,
            h = this.svg.height,
            xScale = d3.scaleTime().domain(xDomain).range([0,this.svg.width - 80]),
            yScale = d3.scaleLinear().domain(yDomain).range([this.svg.height - 40, 0]),
            Y = d => yScale(d['value']),
            X = d => xScale(new Date(d['date'])),
            Y1 = d => yScale(d['y1']),
            Y0 = d => yScale(d['y0']),
            line = d3.line().curve(d3.curveCardinal),
            area = d3.area().curve(d3.curveCardinal).y1(Y1).y0(Y0),
            defineArea = d => (d['y1'] && d['y0']),
            zoom = zoomGraph()
              .x(d => new Date(d['date']))
              .y(d => d['value'])
              //.scaleXDom(xDomain)
              .scaleXRng([0,this.svg.width - 80])
              .scaleYDom(yDomain)
              .scaleYRng([this.svg.height - 40, 0])
              .completion(() => xDomain)
              .zoomElements(function(selection, xz){
                let
                  start = xz.domain()[0],
                  end = xz.domain()[1],
                  result = d => filterTimeRange('date', d['values'], start, end),
                  arrange = d => result(d).bottom(Infinity)
                  ;
                selection
                  .selectAll('.lines circle')
                  .attr('cx', d => d ? xz(new Date(d['date'])) : 0)
                ;
                selection.selectAll('.line').each(function(d){
                  let
                    path = d3.select(this),
                    yDomain  = settings.modules[0].visualize.domain.y,
                    yz = yScale.domain(yDomain),
                    helperDataArray = d['values']
                    ;
                  line
                    .defined(d =>  d['value'])
                    .x(d => xz(new Date(d['date'])))
                    .y(d => yz(d['value']))
                  ;
                  helperDataArray.forEach(k => {
                    k.x = xz(new Date(k['date']));
                    k.y = yz(k['value']);
                  })
                  ;
                  path.attr('d', line(arrange(d)))
                  ;
                })
                ;
                selection.selectAll('.area').each(function(d){
                  let
                    path = d3.select(this)
                    ;
                  area
                    .defined(defineArea)
                    .x( d => xz(new Date(d['date'])));
                  path
                    .attr('d', area(d['values']));
                });
              });
          return zoom;
        },
        cursor: function(){
          var
            i_array = [],
            y_array = [],
            stacking = input => i_array[input],
            margin = {top: 20, right: 50, bottom: 20, left: 30},
            xDomain = this['domain']['x'],
            yDomain = this['domain']['y'],
            cursor = createLinearCursor()
              .convertDt(d => new Date(d['date']))
              .w(this.svg.width)
              .h(this.svg.height)
              .xScale(xDomain)
              .scaleXRng([0,this.svg.width - 80])
              .yScale(yDomain)
              .scaleYRng([this.svg.height - 40, 0])
              .elementClassName('.lines')
              .bisectorAccessor('values')
              .keyAccessor('id')
              .elementIntersection((view, x0, mouse) => {
                let
                  bp_arr = [],
                  abp_arr = []
                  ;
                view.selectAll('.line').each(function (d,i) {
                  var
                    index = i,
                    bisectDate = d3.bisector(d => new Date(d['date'])).right,
                    datum = d,
                    key = datum['id'],
                    i = bisectDate(d['values'],x0,1),
                    d1 = d['values'][i+1],
                    d0 = d['values'] ? d['values'][i] : '*',
                    beginning = 0,
                    end = this.getTotalLength(),
                    target,
                    objFunc = (index, ytxt, key) => {
                      if (key === 'dbp' || key === 'dbp_art'){ return {value: 1000, key: key}; }
                      return {value: ytxt, key:key }
                    }
                    ;
                  if(key === 'sbp' || key === 'dbp'){ if(d0){ bp_arr.push(d0['value']); }}
                  if(key === 'sbp_art' || key === 'dbp_art'){ if(d0){ abp_arr.push(d0['value']); }}
                  while (true){
                    target = Math.floor((beginning + end) / 2);
                    var pos = this.getPointAtLength(target);
                    if ((target === end || target === beginning) && pos.x !== mouse[0]) {
                      break;
                    }
                    if (pos.x > mouse[0])    end = target;
                    else if (pos.x < mouse[0]) beginning = target;
                    else break; //position found
                  }
                  var
                    itxt = (index * 35),
                    ytxt = pos.y,
                    ycrs = pos.y - 10,
                    //  ycrs = pos.y - (+view.attr('height') - margin.top),
                    opacity = d0 ? 1 : 0
                    ;
                  d3.selectAll('.text-' + key ).text(() => {
                    if(d0){
                      if(key === 'dbp' || key === 'sbp'){
                        return 'bp: ' +  bp_arr.reverse().join(' / ');
                      }
                      if(key === 'dbp_art' || key === 'sbp_art'){
                        return 'abp: ' + abp_arr.reverse().join(' / ');
                      }
                      else return d0['value'] ? key + '\t:\t' + d0['value'] : '-';
                    } else return '-';
                  });
                  d3.selectAll('.rect-' + key)
                    .attr('display', () => {
                      if(!d0){ return 'none' } else return d0['value'] ? null : 'none';
                    });
                  d3.selectAll('.text-' + key)
                    .attr('display', () => {
                      if(!d0){ return 'none' } else return d0['value'] ? null : 'none';
                    });
                  view.select('.cursor-' + key )
                    .attr('transform', 'translate(' + 30 + ',' + ycrs + ")")
                    .style('opacity',opacity);
                  i_array.push(itxt);
                  y_array.push(objFunc(index, ytxt, key));
                });

                y_array.sort((a,b) => a.value - b.value);

                y_array.forEach((e,index) => {
                  view
                    .select('.rect-' + e.key)
                    .attr('y', () => {
                      if(e.key === 'dbp_art' || e.key === 'dbp') { return -100; }
                      else return stacking(index); })
                    .attr('x', 50);
                  view
                    .select('.text-' + e.key)
                    .attr('transform', () => {
                      if(e.key === 'dbp_art' || e.key === 'dbp') { return `translate(0,-100)` ; }
                      else return 'translate(' + 55 + ',' + stacking(index) + ')'; });
                  view
                    .selectAll('.overlay').style('display', null);
                });
              });
          return cursor;
        },
        panel: function(){
          var
            data = this['data'],
            yDomain = this['domain']['y'],
            width = this.svg.width,
            height = this.svg.height,
            summary = this['summary'],
            panel = generateControlPanel()
              .tier1(['24HR','72HR','1WK'])
              .click(function(button,parent,domain){})
              .unwrap(function(d){
                return _.chain(data)
                  .filter(o => o['id'] === d.toLowerCase())
                  .first()
                  .pick('values')
                  .values()
                  .flatten()
                  .max('date')
                  .value();
              })
              .value(function(){ return 'value'; })
              .getmaxdt(() => d3.max(summary.days.day, d => new Date(d['startdtm'])))
              .reactprops(function(d){
                if(d == 'bp' || d === 'abp'){
                  return { path: summary.days.day, functionId: 'third'}
                } else return { path: summary.days.day, functionId: 'second'}
              })
            ;
          return panel;
        },
        times:  () => {
          var
            intervals = [{period: '24 Hours', value:24},{period: '72 Hours',value: 72},{period: '1 Week',value:168}],
            query = generateSelectDropdown()
              .reactprops({
                path: intervals,
                parentEl: 'section',
                valueKey: 'period',
                siblingEl: 'buffer',
                multi: false,
                selectValue:'24 Hours',
                clearable:false,
                divStyle: { marginTop: '0px'}})
              .click( value => {
                console.log(value);
              })
              .onchange( value => {
                console.log('here:' , value)
              });
          return query;
        },
        update: function() {
          let
            that = this,
            width = +this['svg']['width'],
            height = +this['svg']['height'],
            domain = that.domain,
            formatDt = d3.timeFormat('%Y/%m/%d %H:%m:%S'),
            str_end = /(?<=end=).+?[^&]+/,
            str_str = /(?<=start=).+?[^&]+/,
            machine = 'http://url.com',
            start = domain.x[0],
            end = domain.x[1],
            machine_update = machine.replace(str_end, formatDt(end)).replace(str_str, formatDt(start)),
            swap = {
              class:'vitalsigns',
              visualize: {
                ws:{ path: machine_update },
                accessors: { raw: null },
                parse: function(){
                  let
                    data = this['data'],
                    parse = parseVitals()
                      .rejectKeys(['bed','facility_id', 'minutes','unit','ts','abpm','nbpm'])
                      // .convertDt(d => new Date(+d['ts']))
                      .convertDt(d => new Date(+d['ts']* 1000))
                      .trimUOM(/[^0-9$.,]/g, '' )
                      .data(data)
                    ;
                  return parse;
                },
                chart: function(){
                  let
                    data = this['data'],
                    chart = updateTimeSeries()
                      .xRange([0,width - 80])
                      .yRange([height - 40,0])
                      .x(d => new Date(d['date']))
                      .y(d => d['value'])
                      .y1(d => d['y1'])
                      .y0(d => d['y0'])
                      .config(that)
                      // .xDomain([
                      //   d3.timeHour.offset(d3.max(data, c => d3.max(c['values'], d => new Date())), -22),
                      //   d3.timeHour.offset(d3.max(data, c => d3.max(c['values'], d => new Date())),)
                      // ])
                      .xDomain(domain.x)
                      .yDomain([
                        d3.min(data, c => d3.min(c['values'], d => d['value'])),
                        d3.max(data, c => d3.max(c['values'], d => d['value']))
                      ])
                      .w(width)
                      .h(height)
                    ;
                  return chart;
                }
              }
            };
          return swap
        },
        toggle: () => {
          let
            toggle = generateSelectDropdown()
              .ws('https://nypdvtest01.sis.nyp.org:8493/HbaseApis/api/isVitalsEmpty?')
              .reactprops({
                checked: false,
                label:'flowsheet',
                labelRight: 'machine',
                name:'vitalsToggle'
              })
              .click( value => {

              })
              .onchange( value => {

              });
          return toggle;
        }
      }
    },

    {
      name:'Ins & Outs',
      class: 'io',
      shapes:'.ion',
      col:12,
      svg:{
        width:600,
        height:250
      },
      visualize:{
        ws:{
          path:'io.json'
        },
        svg:{
          width:null,
          height:null
        },
        headers : ['measure', 'range','current'],
        measures: () => ['in','out','net'],
        accessors:{
          raw: 'io',
          summary: ['io'],
          helper: (data) => parseInsOutsNet().data(data)
        },
        summarykeys:function(){
          var
            pills = this['data'][0],
            keys = _.object(),
            obj = {}
            ;
          Object.keys(pills).forEach(function(o){
            return obj[o.toLowerCase()] = {
              'min': o,
              'max': o
            };
          });
          return obj;
        },
        parse: function(){
          var
            data = this['data'],
            parse = parseInsOutsNet()
              .data(data)
              .filter(function(o){
                return o['w'] === 1 || o['w'] === '1';
              })
            ;
          return parse;
        },
        pills: function(){
          var
            margin = {top: 20, right: 50, bottom: 20, left: 30},
            data = ['in', 'out', 'net'],
            scheme = [ '#b3e5fc','#7986cb','#cfe7d6'],
            yDomain = this.domain.y,
            xDomain = this.domain.x,
            height = this.svg.height - margin.top - margin.bottom,
            width = this.svg.width - margin.left - margin.right,
            yScale = d3.scaleLinear().domain(yDomain).range([height,0]),
            xScale = d3.scaleTime().domain(xDomain).rangeRound([0,width]),
            zScale = d3.scaleOrdinal(scheme),
            keys = reduceToKeys()
              .colors(scheme)
              .unique(() => Object.keys(data[0]))
              .fontColor(['black','white','black'])
              .rejectKeys(['startdtm','enddtm','w'])
              .filter(d => _.filter(data, o => o[d] !== null))
              .elementClassName('bars')
              .reactprops({
                path: data,
                valueKey: 'value',
                multi: true,
                divStyle: { marginTop: '15px'}
              })
              // .reactprops({path:data, removeRenderer:null, onToggle:null, removeX:true})
              .onRemove((button, parent) => null)
              .click(function(button, parent, status){
                var
                  element = parent.selectAll('g .bars'),
                  stackMin = series => d3.min(series, d =>  d[0]),
                  stackMax = series => d3.max(series, d => d[1]),
                  filter = series =>  _.filter(series, d =>  d['key'] !== 'net'),
                  yAxis = d3.select('svg.io.view g.axis--y'),
                  xAxis = d3.select('svg.io.view g.axis--x'),
                  AxisY = d3.axisLeft(yScale),
                  AxisX = d3.axisTop(xScale),
                  t = d3.transition().duration(500),
                  t2 = d3.transition().duration(2000),
                  t3 = d3.transition().duration(3000),
                  tabs = d3.select(parent.node().parentNode).selectAll('.pill');
                if (status){
                  tabs
                    .filter(d => d !== button)
                    .style('background-color','lightgrey');
                  if(button !== 'net'){
                    var rect = element
                      .filter(d => d['key'] !== button)
                      .attr('class','bars not-selected')
                      .transition(t)
                      .selectAll('rect')
                      .transition(t)
                      .attr('y',0)
                      .attr('height',0);
                  }
                  element
                    .filter(d => d['key'] === button)
                    .attr('class','bars selected')
                    .each(function(d){
                      var inner = d3.select(this).selectAll('rect');
                      inner
                        .transition(t)
                        .attr('y', d => d[0]<0 ? yScale(0) : yScale(0) - (yScale(d[0]) - yScale(d[1])))
                        .on('end',function(){
                          var
                            values = _.map(d, d => d['data'][button]),
                            outflow = d3.min(values),
                            extent = d3.max(values)
                            ;
                          switch (true){
                          case (extent === 0):
                            yScale.domain([outflow, 0]);
                            xAxis
                              .transition(t3)
                              .attr('transform','translate(0,' + 0 + ')');
                            inner
                              .transition(t3)
                              .attr('height', d => yScale(d[0]) - yScale(d[1]))
                              .attr('y',0);
                            break;
                          case(outflow === 0):
                            yScale.domain([0, extent]);
                            xAxis
                              .transition(t3)
                              .attr('transform','translate(0,' + height + ')');
                            inner
                              .transition(t3)
                              .attr('height', d => yScale(d[0]) - yScale(d[1]))
                              .attr('y', d => yScale(d[1]));
                            break;
                          case(outflow < 0 && extent > 0):
                            yScale.domain([outflow, extent]);
                            xAxis
                              .transition(t3)
                              .attr('transform','translate(0,' + yScale(0) + ')');
                            element
                              .filter(d => d['key'] === 'in')
                              .selectAll('rect')
                              .transition(t3)
                              .attr('height', d => d['data'][button] < 0 ? 0 :
                                yScale(0) - (yScale(d['data']['in'] + d['data']['out']))
                              )
                              .attr('y', d => yScale(d['data']['in'] + d['data']['out']));
                            element
                              .filter(d => d['key'] === 'out')
                              .selectAll('rect')
                              .transition(t3)
                              .attr('height', d => d['data'][button] < 0 ?
                                yScale(0) - (yScale(-d['data'][button])) : 0
                              )
                              .attr('y', () => yScale(0));
                          }
                          yAxis
                            .transition(t3)
                            .call(AxisY);
                        });
                    });
                } else {
                  var all = filter(element.data());
                  tabs.style('background-color', d => zScale(d));
                  element
                    .each(function(){
                      yScale.domain([d3.min(all,stackMin),d3.max(all,stackMax)]);
                      yAxis
                        .transition(t3)
                        .call(d3.axisLeft(yScale));
                      xAxis
                        .transition(t3)
                        .attr('transform','translate(0,' + yScale(0) + ')');
                    })
                    .filter(d => d['key'] !== 'net')
                    .selectAll('rect')
                    .transition(t3)
                    .attr('y',  d => yScale(d[1]))
                    .attr('height', d => yScale(d[0]) - yScale(d[1]));
                  return status = true;
                }
              });
          return keys;
        },
        chart: function(){
          var
            data = this['data'],
            chart = createStackedBarChart()
              .createStack(function(){
                var
                  keys = Object.keys(data[0]),
                  trimmed = _.without(keys,'startdtm','enddtm','w'),
                  stack = d3.stack()
                    .keys(trimmed)
                    .order(d3.stackOrderNone)
                    .offset(d3.stackOffsetDiverging);
                this.stack = stack;
                return stack;
              })
              .colorBand(['#b3e5fc','#7986cb'])
              .xDomain([d3.timeHour.offset(new Date(),-24), new Date()]);
          // .yDomain()
          // .xDomain([
          //       d3.timeHour.offset(d3.max(data, function(d){ return new Date(d['startdtm']); }),-24),
          //       d3.max(data, function(d){ return new Date(d['startdtm']); })
          //     ]);
          return chart;
        },
        zoom: function(){
          var
            xDomain = this['domain']['x'],
            yDomain = this['domain']['y'],
            zoom = zoomGraph()
              .x(function(d){ return new Date(d['data']['startdtm']);})
              //.y(function(d){ return d['value']})
              //.scaleXDom(xDomain)
              .scaleXRng([0,this.svg.width - 80])
              //.scaleYDom(yDomain)
              .scaleYRng([this.svg.height - 40, 0])
              .completion(function(d){
                return xDomain;
              })
              .zoomElements(function(selection, xz){
                selection.selectAll('.ion')
                  .attr('x', function(d){ return xz( new Date(d['data']['startdtm'])); })
                  .attr('width',function(d){
                    return xz(new Date(d['data']['enddtm'])) - xz(new Date(d['data']['startdtm']));
                  });
              });
          return zoom;
        },
        cursor: function(){
          var
            that = this,
            xDomain = this['domain']['x'],
            xRange = [0,this.svg.width - 80],
            pills = this.pills(),
            xScale = d3.scaleTime().domain(xDomain).range(xRange),
            yDomain = this['domain']['y'],
            cursor = createLinearCursor()
              .convertDt(d => new Date(d['enddtm']))
              .xScale(xDomain)
              .scaleXRng(xRange)
              .yScale(yDomain)
              .scaleYRng([this.svg.height - 40, 0])
              .elementClassName('.bars')
              .keyAccessor('key')
              .mouseover(function(){
                d3.selectAll('.focus').style('display',null);
                d3.selectAll('.legend').style('display',null);
                d3.selectAll('.flag').style('display',null);
              })
              .mouseout(function(){
                d3.selectAll('.focus').style('display','none');
                d3.selectAll('.legend').style('display','none');
                d3.selectAll('.flag').style('display','none');
              })
              .elementIntersection(function(view,x0,mouse){
                let arr = [];
                let activation = that['activation'];
                view.selectAll('.bars').each(function(d,i){
                  var
                    bisectDate = d3.bisector(d => new Date(d['enddtm'])).right,
                    height = view.attr('height'),
                    ind = bisectDate(d.map(o => o['data']),x0,1),
                    itxt = (d['index'] * 15),
                    offset = mouse[0] + 40,
                    d0 = d[ind],
                    key = d['key'].replace(/\W/g,'').split(' ').join(''),
                    size = [],
                    tooltip = view
                      .selectAll('.legend')
                      .style('display',null)
                      .attr('dx',0)
                      .attr('background-color','red')
                      .attr('transform','translate(' + offset + ',' + 10 + ')' ),
                    text = tooltip.selectAll('text').remove(),
                    finder = function(selection){
                      selection
                        .selectAll('text').remove()
                      ;
                      view
                        .selectAll(`.text-${key}`)
                        .attr('transform', `translate(50,-100)`)
                        .filter(d => { return d0['data'][d] !== null; })
                        .text(() => d0 ? `${key}\t:\t${d0['data'][d['key']]}` : '-')
                        .attr('transform', () => {
                          if(d0['data'][key] !== null) { arr.push(key); }
                          return `translate(55,${(arr.indexOf(key) - 2) * 12 })`
                        })
                      ;
                      view
                        .selectAll(`.rect-${key}`)
                        .attr('transform', `translate(50,-100)`)
                        .filter(d => { return d0['data'][d] !== null; })
                        .attr('width', d => d3.select(`.text-${key}`).node().getComputedTextLength() + 10)
                        .attr('transform', () => {
                          if(d0['data'][key] !== null) { arr.push(key); }
                          return `translate(50,${(arr.indexOf(key) - 2) * 12})`
                        });
                    }
                    ;
                  function extendText (selection) {
                    if(!activation) return;
                    let
                      parent = selection.node().parentNode,
                      button = d3.select(parent),
                      mapper = Object.keys(d0['data']).map(o => d0['data'][o]),
                      pos = _.reduce(mapper, (m, x) => !isNaN(m) ? m + (x > 0 ? x : 0) : 0, 0),
                      neg = _.reduce(mapper, (m, x) => !isNaN(m) ? m + (x < 0 ? x : 0) : 0, 0),
                      net = pos + neg,
                      obj = {in: pos, out: neg, net: net}
                      ;
                    Object.keys(obj).forEach( o => {
                      button.select(`.nest.${o} text`).remove()
                      ;
                      d3.select(parent).select(`div.nest.${o}`)
                        .append('text')
                        .attr('class', 'aggregate-totals')
                        .text(obj[o])
                      ;
                    })
                    ;
                  }
                  finder(tooltip);
                  extendText(view);
                  view.selectAll('.bars').selectAll('rect')
                    .filter(function(d){
                      var rx = +d3.select(this).attr('x');
                      if(mouse[0]+ _.max(size) >= rx && rx >= mouse[0]) { return this; }
                    })
                    .style('fill-opacity', 0.25)
                  ;
                  view.selectAll('.bars').selectAll('rect')
                    .filter(function(d){
                      var rx = +d3.select(this).attr('x');
                      if(rx >= mouse[0] + _.max(size) || rx <= mouse[0]) { return this; }
                    })
                    .style('fill-opacity', 1)
                  ;
                });
              })
            ;
          return cursor;
        },
        panel: function(){
          var
            summary = this['summary'],
            data = this['data'],
            panel = generateControlPanel()
              .tier1(['24HR','72HR','1WK'])
              .click(function(button,parent){})
              .unwrap(d => _.chain(data)
                .filter( o => o[d] !== null )
                .max( o => new Date(o['enddtm']))
                .value())
              .value( d => d)
              .getmaxdt(() => d3.max(summary, d => Date(d['enddtm'])))
              .reactprops(function(d){ return {
                path: summary.filter(o => o.w === 24),
                functionId:'first',
              }})
            ;
          return panel;
        },
        times: () => {
          var
            summary = this['summary'],
            intervals = [{period: '24 Hours', value:24},{period: '72 Hours',value: 72},{period: '1 Week',value:168}],
            query = generateSelectDropdown()
              .reactprops({
                path: intervals,
                parentEl: 'section',
                valueKey: 'period',
                siblingEl: 'buffer',
                multi: false,
                selectValue:'24 Hours',
                clearable:false,
                divStyle: { marginTop: '0px'}})
              .click( value => {
                console.log(value);
              })
              .onchange( value => {
                console.log('here:' , value)
              });
          return query;
        }
      }
    },
    {
      name: 'Drips',
      class: 'drips',
      col: 12,
      svg: {
        width:500,
        height:200
      },
      visualize:{
        ws:{
          path:'drips.json'
        },
        svg:{
          width:null,
          height:null
        },
        accessors:{
          raw: 'drip'
        },
        parse: function() {
          var
            data = this['data'],
            parse = parseDrips()
              .data(data);
          return parse;
        },
        pills: function() {
          var
            data = _.uniq(_.map(this['data'], o => o['c2'] ? o['c2'] : 'not classified')).sort(),
            keys = reduceToKeys()
              .reactprops({path: data, removeRenderer:null, onToggle: null})
              .click((value, parent, status) => {
                let
                  filterNotButton = d => d['c2'] === value,
                  filterByButton  = d => d['c2'] !== value,
                  toggle = onCategoryClick()
                    .category('c2')
                    .nameRow('drips')
                    .offsetRow(40)
                    .sortBy(filterNotButton)
                    .filterCategories(filterByButton)
                    .dValue(d => d['itemname'])
                    .singularFilter('execute!');
                return toggle(parent, value, status);
              })
              .onRemove((value, parent, status) => {
                var
                  filterNotButton = d => d['c2'] !== value,
                  filterByButton  = d => d['c2'] === value,
                  toggle = onCategoryClick()
                    .category('c2')
                    .nameRow('drips')
                    .offsetRow(40)
                    .sortBy(filterNotButton)
                    .filterCategories(filterByButton)
                    .dValue(d => d['itemname'])
                  ;
                return toggle(parent, value, status);
              });
          return keys;
        },
        chart: function() {
          var
            data = this['data'],
            chart = timelineBars()
              .dValue(d => d['itemname'])
              .y(d => d['dose'])
              .x0(d => d['recordeddtm'])
              .x1(d => d['recordedendtm'])
              .dataset(d => data)
              .xDomain([d3.timeHour.offset(new Date(), -24), new Date()])
              .yDomain([0, 1])
              .w(+this['svg']['width'])
              .h(+this['svg']['height'])
              .objectAccessor('doses')
              .nameRow('drips')
              .arrayAccessor(d => d['doses']['admin'])
              .textUOM(d => `${d['dose']} ${d['doseunit']}`)
              .elements('path')
              .offsetRow(40);
          return chart;
        },
        zoom: function() {
          var
            xDomain = this['domain']['x'],
            yDomain = this['domain']['y'],
            yScale = d3.scaleLinear(),
            //Y0 = d => yScale(0),
            Y0 = d => yScale(d['dose']),
            Y1 = d => -yScale(d['dose']),
            area = d3.area().curve(d3.curveCardinal).y0(Y0).y1(Y1),
            defineArea = d => d['interval'] < 2 && d['dose'],
            zoom = zoomGraph()
              .x(d => new Date(d['recordeddtm']))
              .scaleXRng([0, this.svg.width - 80])
              .completion(d => xDomain)
              .zoomElements((selection, xz) => {
                selection.selectAll('path.task').each(function(d) {
                  let
                    tasks = d['doses']['admin'],
                    yDom = [0, d3.max(tasks, d => d.dose)]
                    ;
                  yScale
                    .range([0,13]).domain(yDom)
                  ;
                  area
                    .defined(defineArea)
                    .x(d => xz(d['recordeddtm']))
                  ;
                  d3.select(this).attr('d', area(tasks));
                });
                selection.selectAll('.rows .drip.dose')
                  .attr('dx', d => xz(d['recordeddtm']));
                selection.selectAll('.rows')
                  .each(function(){
                    var
                      row = d3.select(this),
                      txt_length = row.select('.drug').node().getComputedTextLength() + 15,
                      dose = row.selectAll('.drip.dose'),
                      task_data = dose.data()
                      ;
                    dose
                      .style('opacity',function(d,i){
                        if(xz(d['recordeddtm']) <= txt_length ){ return 0; }
                        if(i+1 < task_data.length) {
                          if(xz(d['recordeddtm']) + this.getComputedTextLength() + 20 >=
                            xz(task_data[i + 1]['recordeddtm'])) { return 0; }
                          else return 1;
                        }
                      });
                    // row.selectAll('.task')
                    //   .style('opacity',function(d){
                    //     if(xz(d['recordeddtm']) <= txt_length ){ return 0.33; }
                    //     else return 1
                    //   });
                  })
              })
            ;
          return zoom;
        },
        cursor: function() {
          let
            xDomain = this['domain']['x'],
            yDomain = this['domain']['y'],
            xRange = [0, this.svg.width - 80],
            yRange = [this.svg.height - 40, 0],
            margin = {top: 20, right: 50, bottom:20, left:30},
            cursor = createLinearCursor()
              .convertDt(d => d['recordeddtm'])
              .xScale(xDomain)
              .scaleXRng(xRange)
              .yScale(yDomain)
              .scaleYRng(yRange)
              .elementClassName('.rows')
              .keyAccessor('itemname')
              .elementIntersection((view, x0, mouse) => {
                let
                  drips = view.selectAll('.rows.drips:not(.not-selected)').data().map( o => o.itemname),
                  findIndex = k => drips.indexOf(k) >= 0 ? drips.indexOf(k) * 40  : -110
                  ;
                view.selectAll('.rows.drips').each( (d,i,t) => {
                  let
                    index = i,
                    bisectDate = d3.bisector(d => d['recordedendtm']).right,
                    datum = d,
                    key = datum['itemname'].replace(/\W/g,'').split(' ').join(''),
                    ix = bisectDate(d['doses']['admin'], x0, 0),
                    d0 = d['doses']['admin'][ix],
                    roundDt = dt => dt.getMinutes() === 0 ? d3.timeHour.ceil(dt) : dt,
                    check = d0 ? roundDt(d0['recordedendtm']).getTime() === d3.timeHour.ceil(x0).getTime() : false,
                    opacity = check ? 1: 0
                    ;
                  if(d0){
                    //console.log(roundDt(d0['recordedendtm']))
                    // console.log(key, d0['recordedendtm'],x0, d3.timeHour.ceil(x0));
                  }
                  view
                    .select(`.text-${key}`)
                    .text(() => d0 ? `${d0['dose']} ${d0['doseunit']}` : '-' )
                    .attr('display', () => !d0 ? 'none' : null )
                    .attr('transform', `translate(55,${findIndex(datum.itemname)})`)
                    .attr('opacity', opacity)
                  ;
                  view
                    .select(`.rect-${key}`)
                    .attr('display', () => !d0 ? 'none' : null )
                    .attr('y', () => findIndex(datum.itemname))
                    .attr('opacity', opacity)
                    .attr('x', 50);
                  view
                    .selectAll('.overlay').style('display', null);
                });
              });
          return cursor;
        },
        panel: function() {
          var
            summary = this['summary'],
            panel = generateControlPanel()
              .reactprops(function(){
                return {
                  path:null,
                  functionId:null
                }
              })
              .getmaxdt(() => console.log('not defined'));
          return panel;
        },
        times: () => {
          var
            intervals = [{period: '24 Hours', value:24},{period: '72 Hours',value: 72},{period: '1 Week',value:168}],
            query = generateSelectDropdown()
              .reactprops({
                path: intervals,
                parentEl: 'section',
                valueKey: 'period',
                siblingEl: 'buffer',
                multi: false,
                selectValue:'24 Hours',
                clearable:false,
                divStyle: { marginTop: '0px'}
              })
              .click(value => console.log(value))
              .onchange(value => console.log(value))
            ;
          return query;
        }
      }
    },
    {
      name: 'Medications',
      class: 'prescriptions',
      shapes:'rect',
      col: 12,
      svg: {
        width: 500,
        height:700
      },
      visualize:{
        ws:{
          path: 'meds.json'
        },
        svg:{
          width:null,
          height:null
        },
        headers:['measure','range','current'],
        intervals: ['24 HOUR'],
        inner: ['range','current'],
        accessors:{
          raw: 'mar|drug',
          summary: null
        },
        parse: function(){
          var
            data = this['data'] ? this['data'] : [{"c2":"No Medications","tasks":{"task":[{"performeddtm":new Date()}]}}] ,
            parse = parseMeds()
              .data(data);
          return parse;
        },
        chart: function(){
          var
            array = [],
            data = this['data'],
            map = Object.keys(data).forEach(function(d) {
              array.push(d3.max(data[d], function(c) {
                return d3.max(c['tasks']['task'], function(k) {
                  return new Date(k['performeddtm']);
                });
              }));
            }),
            max = d3.max(array),
            chart = timelineBars()
              .dValue(d => d['drugname'])
              .x0(d => d['performeddtm'])
              .x1(d => d['performedendtm'])
              .y(d => d['value'])
              .dataset(d => d['tasks']['task'])
              .xDomain([ d3.timeHour.offset(new Date(), -24), new Date()])
              .yDomain([0, 1])
              .w(+this['svg']['width'])
              .h(+this['svg']['height'])
              .objectAccessor('tasks')
              .nameRow('medications')
              .arrayAccessor(d => d['tasks']['task'])
              .textUOM(d => `${d['orderdose']} ${d['uom']}`)
              .elements('rect')
              .offsetRow(15);
          return chart;
        },
        pills: function(){
          var
            data = _.uniq(_.map(this['data'], o => o['c2']? o['c2'] : 'not classified')).sort(),
            keys = reduceToKeys()
              .reactprops({path: data, removeRenderer: null, onToggle: null  })
              .colors('#3cb371')
              .filter( d => _.filter(data, o => o == d.toLowerCase()))
              .click((value,parent,status) => {
                let
                  filterNotButton = d => d['c2'] === value,
                  filterByButton  = d => d['c2'] !== value,
                  toggle = onCategoryClick()
                    .category('c2')
                    .nameRow('medications')
                    .offsetRow(15)
                    .sortBy(filterNotButton)
                    .filterCategories(filterByButton)
                    .dValue(d => d['drugname'])
                    .singularFilter('execute!');
                return toggle(parent, value, status);
              })
              .onRemove((value, parent, status) => {
                let
                  filterNotButton = d => d['c2'] !== value,
                  filterByButton  = d => d['c2'] === value,
                  toggle = onCategoryClick()
                    .category('c2')
                    .nameRow('medications')
                    .offsetRow(15)
                    .sortBy(filterNotButton)
                    .filterCategories(filterByButton)
                    .dValue(d => d['drugname']);
                return toggle(parent, value, status);
              });
          return keys;
        },
        zoom: function(){
          var
            xDomain = this['domain']['x'],
            zoom = zoomGraph()
              .x(d => d['performeddtm'])
              //.scaleXDom(xDomain)
              .scaleXRng([0, this.svg.width - 80])
              .completion(d => xDomain)
              .zoomElements(function(selection,xz){
                var
                  parent = d3.select('.prescriptions').node().parentNode,
                  container = d3.select(parent)
                  ;
                container.selectAll('.rows rect.task')
                  .attr('x', d => xz(d['performeddtm']));
                container.selectAll('.rows .dose')
                  .attr('dx', d => xz(d['performeddtm']) + 10);
                container.selectAll('.rows')
                  .each(function(){
                    var
                      row = d3.select(this),
                      txt_length = row.select('.drug').node().getComputedTextLength() + 15,
                      dose = row.selectAll('.dose'),
                      task_data = dose.data()
                      ;
                    dose
                      .style('opacity',function(d,i){
                        if(xz(d['performeddtm']) <= txt_length ){ return 0; }
                        if(i+1 < task_data.length) {
                          if(xz(d['performeddtm']) + this.getComputedTextLength() + 20 >=
                            xz(task_data[i + 1]['performeddtm'])) { return 0; }
                          else return 1;
                        }
                      });
                    row.selectAll('.task')
                      .style('opacity',function(d){
                        if(xz(d['performeddtm']) <= txt_length ){ return 0.33; }
                        else return 1;
                      });
                  });
              });
          return zoom;
        },
        cursor: function(){
          var
            xDomain = this['domain']['x'],
            yDomain = this['domain']['y'],
            xRange = [0,this.svg.width - 80],
            xScale = d3.scaleTime().domain(xDomain).range(xRange),
            cursor = createLinearCursor()
              .convertDt( d => d['performeddtm'])
              .xScale(xDomain)
              .scaleXRng([0,this.svg.width - 80])
              .yScale(yDomain)
              .scaleYRng([this.svg.height - 40, 0])
              .elementIntersection((view, x0, mouse) => {
                view.selectAll('rect.meds').each(function(d,i) {
                  let
                    start = d3.timeMinute.offset(x0, -10),
                    end = d3.timeMinute.offset(x0, 10),
                    index = i,
                    bisectDate = d3.bisector(d => new Date(d['performeddtm'])).right,
                    key = d['drugname'],
                    label = d3.selectAll('text.drug').filter(d => d['drugname'] === key ),
                    length = label.node().getComputedTextLength() + 10,
                    datum = d['tasks']['task'],
                    result = filterTimeRange('performeddtm', datum, start, end),
                    range = result.bottom(Infinity)
                    ;
                  if(range.length > 0){
                    label
                      .transition()
                      .duration(200)
                      .attr('transform', `translate(${mouse[0]  - length },-5)`);
                  } else {
                    label
                      .transition()
                      .duration(200)
                      .attr('transform', `translate(15,0)`);
                  }
                })
              });
          return cursor;
        },
        panel: function(){
          var
            summary = this['summary'],
            panel = generateControlPanel()
              .reactprops(function() {
                return {
                  path:[],
                  functionId:'something'
                }
              })
              .getmaxdt(() => console.log('summary not defined'));
          return panel;
        },
        search: function(){
          var
            data = this['data'],
            query = generateSelectDropdown()
              .reactprops({
                path: _.sortBy(data, o => o['drugname'].toLowerCase()) ,
                valueKey: 'drugname',
                siblingEl:'task-list',
                multi: true,
                divStyle: { marginTop: '15px'}
              })
              .click( value => {
                let domContainer = document.querySelector('.task-list');
                ReactDOM.render(React.createElement(createTaskSummary, {path:value}), domContainer);
              })
              .onchange( value => {
                let
                  row = d3.selectAll('.rows.medications'),
                  data = d3.selectAll('.rows.medications:not(.not-selected').data();
                if(value.length){
                  value.filter(o => {
                    let
                      meds_on = d => d['drugname'] === o['drugname'],
                      meds_off = d => d['drugname'] !== o['drugname']
                      ;
                    row
                      .classed('not-selected',false)
                      .filter(d => meds_on(d))
                      .classed('selected', true)
                      .transition()
                      .duration(1000)
                      .attr('transform', d => `translate(0,${15 * (value.indexOf(d) + 1)})`)
                      .style('opacity',1)
                      .selectAll('.meds')
                      .attr('fill', d => value.indexOf(d) % 2 === 0 ? '#d6d5d1' : 'white')
                    ;
                    d3.selectAll('.rows.medications:not(.selected)')
                      .transition()
                      .duration(1000)
                      .style('opacity', 0)
                      .style('height','0px')
                      .style('position', 'absolute')
                      .style('left', 0);
                  })
                } else
                  d3.selectAll('.rows.medications')
                    .classed('selected', false)
                    .transition()
                    .duration(1000)
                    .attr('transform', d => `translate(0,${15 * (_.findIndex(data, o => o === d) + 1)})`)
                    .style('opacity',1)
                    .selectAll('.meds')
                    .attr('fill', d => data.indexOf(d) % 2 === 0 ? '#d6d5d1' : 'white');

                d3.selectAll('.rows.medications.not-selected')
                  .transition()
                  .duration(1000)
                  .style('opacity',0);
              });
          return query;
        },
        times: () => {
          var
            summary = this['summary'],
            intervals = [{period: '24 Hours', value:24},{period: '72 Hours',value: 72},{period: '1 Week',value:168}],
            query = generateSelectDropdown()
              .reactprops({
                path: intervals,
                parentEl: 'section',
                valueKey: 'period',
                siblingEl: 'buffer',
                multi: false,
                selectValue:'24 Hours',
                clearable:false,
                divStyle: { marginTop: '0px'}})
              .click( value => {
                console.log(value);
              })
              .onchange( value => {
                console.log('here:' , value)
              });

          return query;
        }
      }
    }
  ],
  dropdowns:[{
    id:'#visit-selection',
    name:'Visit History'
  },{
    id:'#vitalsign-selection',
    name:'VitalSigns'
  }]
};

