function reduceToKeys(){
  var
    margin = {top: 20, right: 50, bottom: 20, left: 30},
    data = [],
    colors = [],
    padding = 'none',
    font_color = 'black',
    element = '.line',
    reject = [],
    properties = function(d){},
    xValue  = function(){ return new Date(); },
    yValue  = function(){ return 0; },
    valueY1 = function(){ return 1; },
    valueY0 = function(){ return 0; },
    xScale = d3.scaleTime(),
    yScale = d3.scaleLinear(),
    line = d3.line().curve(d3.curveCardinal).x(X).y(Y),
    area = d3.area().curve(d3.curveCardinal).x(line.x()),
    next = function(){},
    click = function(){},
    remove = function(){ throw 'not defined'},
    xDom = [d3.timeHour.offset(new Date(),-24), new Date()],
    xRng = [0,100],
    yDom = [0,100],
    yRng = [100,0],
    completion = function(){},
    settings
    ;
  function keys(){
    return _.difference(completion(),reject);
  }

  function lineInterpolation(selection, draw, opacity, completion){
    selection
      .transition()
      .on('end', function(d){
        d3.select(this)
          .transition()
          .duration(2000)
          .style('opacity',opacity)
          .attrTween('d', function(d){
            var
              previous = d3.select(this).attr('d'),
              current = draw(d['values'])
              ;
            return d3.interpolate(previous, current);
          });
        completion();
      });
  }

  function filterInterpolation(selection,shape,t){
    selection
      .transition()
      .duration(2000)
      .attrTween('d',function(d) {
        var
          previous = d3.select(this).attr('d'),
          current = draw(shape)(d['values']);
        return d3.interpolatePath(previous, current);
      });
  }

  function translateShapes(selection, xDomain, yDomain, shape){
    var
      g = selection.node().parentNode,
      parent = d3.select(g.parentNode),
      yAxis = parent.select('g.axis--y'),
      axisY = d3.axisLeft(yScale)
      ;
    yScale
      .range(yRng)
      .domain(yDomain);

    xScale
      .range(xRng)
      .domain(xDomain);

    settings
      .domain.y = yScale.domain();

    yAxis
      .transition()
      .duration(2000)
      .call(axisY);

    parent.selectAll('g.lines')
      .selectAll('circle')
      .transition()
      .duration(2000)
      .attr('cy',function(d){ return Y(d); });

    // parent.selectAll('g.lines')
    //   .filter(function(d){
    //     return d['id'] === id.toLowerCase();
    //   })
    //   .selectAll('circle')
    //   .transition()
    //   .duration(2000)
    //   .style('opacity',1)
    //   .attr('cy',function(d){ return Y(d);});

    filterInterpolation(selection,shape,0);
  }

  function findDomain(list, iteratorMin, iteratorMax){
    return [
      d3.min(list, function(d){ return d[iteratorMin]; }),
      d3.max(list, function(d){ return d[iteratorMax]; })
    ]
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
    return yScale(valueY1(d));
  }

  function Y0(d){
    return yScale(valueY0(d));
  }

  function draw(shape){
    if(shape === 'area'){
      return area.y0(Y0).y1(Y1).defined(function(d) { return valueY0(d) && valueY1(d);})
    }
    if(shape === 'line'){
      return line.y(Y).defined(yValue);
    }
  }

  keys.config = function(_) {
    if(!arguments.length) return settings;
    settings = _;
    return keys;
  };

  keys.unique = function(_) {
    if(!arguments.length) return data;
    completion = _;
    return keys;
  };

  keys.rejectKeys = function(_) {
    if(!arguments.length) return reject;
    reject = _;
    return keys;
  };

  keys.colors = function(_) {
    if(!arguments.length) return colors;
    colors = _;
    return keys;
  };

  keys.padding = function(_) {
    if(!arguments.length) return padding;
    padding = _;
    return keys;
  };

  keys.fontColor = function(_) {
    if(!arguments.length) return font_color;
    font_color = _;
    return keys;
  };

  keys.filter = function(_) {
    if(!arguments.length) return next;
    next = _;
    return keys;
  };

  keys.elementClassName = function(_){
    if(!arguments.length) return element;
    element = _;
    return keys;
  };

  keys.click = function(_) {
    if(!arguments.length) return click;
    click = _;
    return keys;
  };

  keys.onRemove = function(_) {
    if(!arguments.length) return remove;
    remove = _;
    return keys;
  };

  keys.x = function(_) {
    if(!arguments.length) return xValue;
    xValue = _;
    return keys;
  };

  keys.y = function(_) {
    if(!arguments.length) return yValue;
    yValue = _;
    return keys;
  };

  keys.y0 = function(_) {
    if(!arguments.length) return valueY0;
    valueY0 = _;
    return keys;
  };

  keys.y1 = function(_) {
    if(!arguments.length) return valueY1;
    valueY1 = _;
    return keys;
  };

  keys.xDomain = function(_) {
    if(!arguments.length) return xDom;
    xDom = _;
    return keys;
  };

  keys.xRange = function(_) {
    if(!arguments.length) return xRng;
    xRng = _;
    return keys;
  };

  keys.yDomain = function(_) {
    if(!arguments.length) return yDom;
    yDom = _;
    return keys;
  };

  keys.yRange = function(_) {
    if(!arguments.length) return yRng;
    yRng = _;
    return keys;
  };

  keys.domainAccessor = function(list, min, max) {
    if(!arguments.length) return [0,100];
    return findDomain(list, min, max);
    //return keys;
  };

  keys.translator = function(selection, xDomain, yDomain, definition, draw) {
    if(!arguments.length) return translateShapes(null);
    translateShapes(selection, xDomain, yDomain, definition, draw);
    return keys;
  };

  keys.interpolator = function(selection, draw, opacity, completion){
    if(!arguments.length) return translateShapes(null);
    lineInterpolation(selection,draw, opacity, completion);
    return keys;
  };

  keys.reactprops = function(_){
    if(!arguments.length) return properties;
    properties = _;
    return keys;
  };

  return keys;
}

