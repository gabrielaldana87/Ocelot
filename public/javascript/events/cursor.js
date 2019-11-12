function createLinearCursor(){
  var
    width = 0,
    height = 0,
    margin = {top: 20, right: 50, bottom: 20, left: 30},
    cubism_axisFormatMinutes = d3.timeFormat("%I:%M %p"),
    cubism_axisFormatDay = d3.timeFormat("%a %m/%d"),
    cubism_axisFormatTime = d3.timeFormat("%I:%M %p"),
    datetime = new Date(),
    element = 'test',
    xScale = d3.scaleTime(),
    yScale = d3.scaleLinear(),
    xValue = () => new Date(),
    yValue = () => 0,
    accessor = (d) => d,
    elementIntersector = () =>  {throw 'no intersector defined'},
    keyAccess = () => 'id',
    settings,
    modules
    ;

  function navigate(selection){
    selection.each(function(d){
      var
        svg = d3.select(this),
        tooltip = svg
          .append('g')
          .attr('class','legend'),
        flag = svg
          .append('g')
          .attr('class','flag')
          .attr('font-size','10px')
          .attr('fill','grey')
          .attr('font-weight','400'),
        tag = svg
          .append('g')
          .attr('class','tag'),
        focus = svg
          .append('g')
          .attr('class','focus')
          .style('display','none'),
        text = svg
          .select('g')
          .append('text')
          .attr('class', 'sampling-txt')
          .attr('display', null)
          .attr('transform',`translate(${width - 250},${height + 10})`),
        axisX = svg.select('g.axis.axis--x'),
        axTxt = axisX.selectAll('text'),
        tick = d3.select(axisX.node().appendChild(axTxt.node().cloneNode(true)))
          .attr('class','cursor-text')
          .text(null)
        ;
      focus.append('line')
        .attr('transform','translate(30,0)')
        .attr('x1',0)
        .attr('y1',-1000)//TODO: Reference this as the height of the page
        .attr('x2',0)
        .attr('y2',2000)
        .attr('stroke','lightgrey')
        .attr('stroke-width','1px');

      svg.selectAll(element).each(function(d){
        let key = d[keyAccess].replace(/\W/g,'').split(' ').join('')
          ;
        focus
          .append('rect')
          .attr('width', 75)
          .attr('height',20)
          // .attr('fill','rgba(237,20,61,.28)')
          .attr('fill','rgba(255,255,255,.75)')
          .attr('rx',3)
          .attr('class', 'overlay rect-' + key )
          .attr('stroke','lightgray')
          .attr('stroke-width',1)
        ;
        focus
          .append('text')
          .attr('class','overlay text-' + key )
          .attr('dy','1.25em')
          .attr('font-size','10px')
          .attr('fill','grey')
          .attr('font-weight','400')
        ;
        if (element === '.lines'){
          focus
            .append('circle')
            .attr('class','overlay cursor-' + key )
            .attr('r',5)
            .style('stroke', d3.select(this).select('path').style('stroke'))
            .style('fill','none')
            .style('stroke-width','1px')
            .style('opacity',0)
          ;
        }
      });
      svg
        .on('mouseover', mouseover)
        .on('mouseout' , mouseout )
        .on('mousemove', mousemove )
    });
  }

  function mouseover(){
    d3.selectAll('.focus').style('display', null);
    d3.selectAll('.legend').style('display', null);
    d3.selectAll('.flag').style('display',null);
  }

  function mouseout(){
    d3.selectAll('.focus').style('display', 'none');
    d3.selectAll('.legend').style('display', 'none');
    d3.selectAll('.flag').style('display','none');
  }

  function mousemove(){
    var
      xDomain = settings.visualize.domain.x,
      mouse = d3.mouse(d3.select(this).selectAll('g').node()), //need this one
      x0 = xScale.invert(mouse[0]),
      x = xScale.domain(xDomain),
      x_plus = x(x0) - 30,
      view = d3.select(this),
      tick = d3.selectAll('.cursor-text'),
      day_text = d3.selectAll('.desc.cursor-day.current'),
      time_text = d3.selectAll('.desc.cursor-time'),
      dx = tick.node().getComputedTextLength() + 0
      ;
    d3.selectAll('.focus')
      .style('display',null)
      .each(function(){
        var id = d3.select(this).attr('id');
        if(id){
          return d3.select(this)
            .attr('transform','translate(' + x_plus + ',' + view.attr('height') + ')');
        }
        d3.select(this)
          .attr('transform',`translate(${x(x0)},30)`);
      });

    tick
      .attr('x',x(x0))
      .text(cubism_axisFormatMinutes(x0));

    day_text
      .text(cubism_axisFormatDay(x0));

    time_text
      .text(cubism_axisFormatTime(x0));

    d3.selectAll('.view').select('g.axis.axis--x').selectAll('text')
      .transition()
      .duration(200)
      .style('fill-opacity', function(d) { return Math.abs(x(d) - x(x0)) < dx ? 0 : 1; });

    modules.forEach(function(e){
      var
        cursor = e.visualize.cursor(),
        that = d3.select('svg.' + e.class),
        intersectAll = cursor.elementIntersection()
        ;
      intersectAll(that,x0,mouse);
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

  navigate.config = function(_) {
    if(!arguments.length) return settings;
    settings = _;
    return navigate;
  };

  navigate.modules = function(_) {
    if(!arguments.length) return modules;
    modules = _;
    return navigate;
  };

  navigate.x = function(_) {
    if(!arguments.length) return xValue;
    xValue = _;
    return navigate;
  };

  navigate.y = function(_) {
    if(!arguments.length) return yValue;
    yValue = _;
    return navigate;
  };

  navigate.convertDt = function(_){
    if(!arguments.length) return datetime;
    datetime = _;
    return navigate;
  };

  navigate.xScale = function(_){
    if(!arguments.length) return xScale;
    xScale.domain(_);
    return navigate;
  };

  navigate.scaleXRng = function(_){
    if(!arguments.length) return xScale;
    xScale.range(_);
    return navigate;
  };

  navigate.yScale = function(completion){
    if(!arguments.length) return [];
    yScale.domain(completion);
    return navigate;
  };

  navigate.scaleYRng = function(_){
    if(!arguments.length) return yScale;
    yScale.range(_);
    return navigate;
  };

  navigate.elementClassName = function(_){
    if(!arguments.length) return 'test';
    element = _;
    return navigate;
  };

  navigate.elementIntersection = function(_){
    if(!arguments.length) return elementIntersector;
    elementIntersector = _;
    return navigate;
  };

  navigate.mouseout = function(_){
    if(!arguments.length) return mouseout;
    mouseout = _;
    return navigate;
  };

  navigate.mouseover = function(_){
    if(!arguments.length) return mouseover;
    mouseover = _;
    return navigate;
  };

  navigate.bisectorAccessor = function(_){
    if(!arguments.length) return accessor;
    accessor = function(d){
      return d[_];
    };
    return navigate;
  };

  navigate.keyAccessor = function(_){
    if(!arguments.length) return keyAccess;
    keyAccess = _;
    return navigate;
  };

  navigate.w = function (w) {
    if (!arguments.length) return width;
    width = w - margin.left - margin.right;
    return navigate;
  };

  navigate.h = function (h) {
    if (!arguments.length) return height;
    height = h - margin.top - margin.bottom;
    return navigate;
  };

  return navigate;

}