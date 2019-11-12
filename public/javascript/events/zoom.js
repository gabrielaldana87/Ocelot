function zoomGraph(){
  var
    xScale = d3.scaleTime(),
    yScale = d3.scaleLinear(),
    xValue = function(){ return new Date(); },
    yValue = function(){ return 0; },
    completion = function(){ console.log('no zoom function!'); },
    animateThis = function(){ console.log('no elements selected'); },
    settings
    ;
  function zoom(){
    var
      svg = d3.select(this),
      views = d3.selectAll('svg.view'),
      tick = d3.select('text.cursor-text'),
      mouse = d3.mouse(d3.select(this).selectAll('g').node()),
      t = d3.event.transform,
      selections = views.filter(function(d,i){
        return d3.select(this).attr('class') !== svg.attr('class');
      }),
      a = completion(),
      tx = xScale.domain(a),
      xAxis = d3.selectAll('g.axis--x'),
      x = xScale.copy(),
      AxisX = d3.axisTop(tx),
      xz = t.rescaleX(tx)
      ;
    settings.forEach(function(e){
      var
        selection = d3.select('svg.' + e.class),
        axTxt = xAxis.selectAll('text'),
        dx = tick.node().getComputedTextLength() + 0,
        x0 = xz.invert(mouse[0])
        ;
      xzScale(xz)
      ;
      axTxt
        .transition()
        .duration(350)
        .style('fill-opacity', function(d){ return Math.abs(x(d) - x(x0)) < dx ? 0: 1; })
      ;
      xAxis.call(AxisX.scale(xz))
      ;
      if(selection){
        animateThis(selection,xz);
      }
      if(selections){
        if(svg.classed(e.class)) return;
        var
          zoomed = e.visualize.zoom(),
          zoom = d3.zoom().on('zoom',zoomed.config()),
          animateViews = zoomed.zoomElements()
          ;
        animateViews(selections,xz);
        zoom.transform(selections,d3.event.transform);
      }
    });
  }

  function xzScale(x) {
    d3.map(settings,function(e){
      return e.visualize.domain.x = x.domain();
    });
  }

  function defineArea(d){
    return d['y1'] && d['y0'];
  }

  zoom.config = function(_) {
    if(!arguments.length) return settings;
    settings = _;
    return zoom;
  };

  zoom.x = function(_) {
    if(!arguments.length) return xValue;
    xValue = _;
    return zoom;
  };

  zoom.y = function(_) {
    if(!arguments.length) return yValue;
    yValue = _;
    return zoom;
  };

  zoom.scaleXDom = function(completion){
    if(!arguments.length) return xScale;
    xScale.domain(completion);
    return zoom;
  };

  zoom.scaleXRng = function(_){
    if(!arguments.length) return xScale;
    xScale.range(_);
    return zoom;
  };

  zoom.scaleYDom = function(completion){
    if(!arguments.length) return [];
    yScale.domain(completion);
    return zoom;
  };

  zoom.scaleYRng = function(_){
    if(!arguments.length) return yScale;
    yScale.range(_);
    return zoom;
  };

  zoom.elementClassName = function(_){
    if(!arguments.length) return 'test';
    element = _;
    return zoom;
  };

  zoom.completion = function(_){
    if(!arguments.length) return completion;
    completion = _;
    return zoom;
  };

  zoom.zoomElements = function(_){
    if(!arguments.length) return animateThis;
    animateThis = _;
    return zoom;
  };

  return zoom;

}