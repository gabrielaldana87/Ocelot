function multiLineTimeSeries() {
  var
    margin = {top: 20, right: 50, bottom: 20, left: 30},
    width = 0,
    height = 0,
    combo = {},
    array = [],
    xValue  = () => new Date(),
    yValue  = () => 0,
    valueY1 = () => 1,
    valueY0 = () => 0,
    xScale = d3.scaleTime(),
    yScale = d3.scaleLinear(),
    zScale = d3.scaleOrdinal(['#6495ed','#f39c12','#f39c12','#ffc0cb','#ffc0cb','#1abc9c','crimson','steelblue','#3cb371']),
    xAxis = d3.axisTop(xScale),
    yAxis = d3.axisLeft(yScale),
    line = d3.line().curve(d3.curveCardinal).x(X).y(Y),
    area = d3.area().curve(d3.curveCardinal).x(line.x())
    ;

  function chart(selection) {
    selection.each(function(data) {
      var
        svg = d3.select(this).classed('view',true),
        j = -1,
        ob1 = {},
        ob2 = {},
        g = svg.select("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        ;

      xScale
        .range([0, width]);

      yScale
        .range([height, 0]);

      zScale
        .domain(data.map( c =>  c['id']));

      g.append('g')
        .attr('class', 'axis axis--x')
        .call(xAxis);

      g.append('g')
        .attr('class', 'axis axis--y')
        .call(yAxis);

      var
        lines = g.selectAll('.lines')
          .data(data)
          .enter().append('g')
          .attr('class', d => 'lines ' + d['id']),
        bp_array = [],
        bpo = lines.filter( d => {
          return d['id'] === 'sbp_art' || d['id'] === 'dbp_art' || d['id'] === 'sbp' || d['id'] === 'dbp';
        })
        ;
      bpo.data().map( d => {
        ob1.id = 'abp';
        ob2.id = 'bp';
        if(d['id'] === 'sbp_art'){
          bp_array.push(reparseABP(ob1,d));
        }
        if(d['id'] === 'dbp_art'){
          bp_array.push(reparseABP(ob1,d));
        }
        if(d['id'] === 'sbp'){
          bp_array.push(reparseABP(ob2,d));
        }
        if(d['id'] === 'dbp'){
          bp_array.push(reparseABP(ob2,d));
        }
      });

      g.selectAll('area')
        .data(bp_array.slice(0,2))
        .enter()
        .append('path')
        .attr('class', d => 'vital area ' + d['id'])
        .attr('d', d => area.defined(defineArea).y1(Y1).y0(Y0)(d['values']))
      ;
      lines
        .append('path')
        .attr('class', d => 'vital line ' + d['id'])
        .attr('d', d => line.defined(yValue)(d['values']))
        .attr('data-index', (d,i) => i )
        .style('stroke-width', 2)
        .filter( d => d['id'] === 'sbp_art' || d['id'] === 'dbp_art' || d['id'] === 'sbp' || d['id'] === 'dbp')
        .style('stroke-opacity',.5)
      ;
      lines
        .selectAll('circle')
        .append('g')
        .data(d => d['values'])
        .enter()
        .append('circle')
        .attr('r',2)
        .attr('cx', d => X(d) )
        .attr('cy', d => Y(d) )
        // .style('stroke', function(d,i){
        //   if(i == 0) { j++ }
        //   return zScale(data[j]['id']);
        // })
        .attr('stroke-width',1)
        .filter(function(d){
          if(!yValue(d)){
            return d3.select(this).remove();
          }
        });

      lines
        .filter( d => {
          return d['id'] === 'sbp_art' || d['id'] === 'dbp_art' || d['id'] === 'sbp' || d['id'] === 'dbp';
        })
        .selectAll('circle')
        .attr('rx',.2)
        .style('opacity',1);

      d3.select(svg.node().parentNode)
        .select('.pill')
        .style('background-color', d => zScale(d['id']) )
    });
  }
  // The x-accessor for the path generator; xScale ∘ xValue.
  function X(d) {
    return xScale(xValue(d));
  }
  // The x-accessor for the path generator; yScale ∘ yValue.
  function Y(d) {
    return yScale(yValue(d));
  }

  function Y1(d){
    return yScale(d['y1']);
  }

  function Y0(d){
    return yScale(d['y0']);
  }

  function defineArea(d){
    return valueY0(d) && valueY1(d);
  }

  function reparseABP(abp,d){
    if(abp.values){
      abp.values.map(function(o){
        var val = _.filter(d['values'],function(k){
          return o['date'].getTime() === k['date'].getTime()
        });
        return o.y0 = val[val.length-1]['value'];
      });
    } else
      abp.values = d['values'].map(function(o) {
        return {date: o['date'], y1:o['value']};
      });
    return abp;
  }

  chart.x = function(_) {
    if(!arguments.length) return xValue;
    xValue = _;
    return chart;
  };

  chart.y = function(_) {
    if(!arguments.length) return yValue;
    yValue = _;
    return chart;
  };

  chart.y1 = function(_) {
    if(!arguments.length) return valueY1;
    valueY1 = _;
    return chart;
  };

  chart.y0 = function(_) {
    if(!arguments.length) return valueY0;
    valueY0 = _;
    return chart;
  };

  chart.xDomain = function(_) {
    if(!arguments.length) return xScale;
    xScale.domain(_);
    return chart;
  };

  chart.yDomain = function(_) {
    if(!arguments.length) return yScale;
    yScale.domain(_);
    return chart;
  };

  chart.xScale = function(completion) {
    completion(xScale);
    return chart;
  };

  chart.yScale = function(completion) {
    completion(yScale);
    return chart;
  };

  chart.w = function(w) {
    if(!arguments.length) return width;
    width =  w  - margin.left - margin.right;
    return chart;
  };

  chart.h = function(h) {
    if(!arguments.length) return height;
    height =  h  - margin.top - margin.bottom;
    return chart;
  };

  return chart;

}