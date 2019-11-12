function createStackedBarChart(){
  var
    margin = {top: 20, right: 50, bottom: 20, left: 30},
    xScale = d3.scaleTime(),
    yScale = d3.scaleLinear(),
    zScale = d3.scaleOrdinal(),
    colorRange = [],
    stack = function(){ }
    ;

  function chart(selection){
    selection.each(function(data){
      var
        ser = stack(data),
        fstack = filter(ser),
        svg = d3.select(this).classed('view',true),
        width = +svg.attr('width') - margin.left - margin.right,
        height = +svg.attr('height') - margin.top - margin.bottom,
        g = svg.select('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        ;
      xScale
        .rangeRound([0,width]);

      yScale
        .domain([d3.min(fstack,stackMin), d3.max(fstack, stackMax)])
        .range([height,0]);

      zScale
        .range(colorRange);

      var series = g.selectAll('.series')
        .data(ser)
        .enter().append('g')
        .attr('class','bars')
        .attr('fill',function(d,i){ return zScale(i)});

      var rect = series.selectAll('rect')
        .data(function(d){ return d;})
        .enter().append('rect')
        .attr('class','ion')
        .attr('x', function(d){ return xScale( new Date(d['data']['startdtm'])); })
        .attr('y', height )
        .attr('width', function(d){
          return (xScale( new Date(d['data']['enddtm']))  - xScale(new Date(d['data']['startdtm'])))  ;
        })
        .attr('height',0);

      rect
        .attr('y', function(d) { return yScale(d[1]); })
        .attr('height',function(d) { return yScale(d[0]) - yScale(d[1]) ;});

      series
        .filter(function(d){
          return d['key'] === 'net';
        })
        .selectAll('rect')
        .attr('height', 0)
      ;
      g.append('g')
        .attr('class','axis axis--x')
        .attr('transform', 'translate(0,' + yScale(0) + ')')
        .call(d3.axisTop(xScale));

      g.append('g')
        .attr('class','axis axis--y')
        .attr('transform','translate(' + 0 + ',0)')
        .call(d3.axisLeft(yScale)
          // .tickFormat(d3.format('.0s'))
        );
    });
  }

  function stackMin(serie) {
    return d3.min(serie, function(d){ return d[0]; });
  }

  function stackMax(serie) {
    return d3.max(serie, function(d){ return d[1]; });
  }

  function filter(ser){
    return _.filter(ser, function(d){ return d['key'] !== 'net';})
  }

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

  chart.createStack = function(completion) {
    if(!arguments.length) return stack;
    stack = completion();
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

  chart.colorBand = function(_) {
    if(!arguments.length) return colorRange;
    colorRange = _;
    return chart;
  }
  ;

  return chart;
}