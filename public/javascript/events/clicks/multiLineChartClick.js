function onValueClick() {
  var
    margin = {top: 20, right: 50, bottom: 20, left: 30},
    scheme = ['#6495ed','#f39c12','#ffc0cb','#1abc9c','crimson','steelblue','#3cb371'],//d3.schemeCategory20,
    height = 0,
    width = 0,
    xValue  = () => new Date(),
    yValue  = () => 0,
    valueY1 = () => 1,
    valueY0 = () => 0,
    xScale = d3.scaleTime(),
    yScale = d3.scaleLinear(),
    zScale = d3.scaleOrdinal(scheme),
    line = d3.line().curve(d3.curveCardinal).x(X).y(Y),
    area = d3.area().curve(d3.curveCardinal).x(line.x()),
    xDomain = [d3.timeHour.offset(new Date(),-24), new Date()],
    xRng = [0,100],
    yDomain = [0,100],
    yRng = [100,0],
    single = null,
    settings,
    opacity,
    filterForYDom = d => d.id,
    filterOneValue = d => d.id,
    extendFeatureTrue = () => { return 'no completion'; },
    extendFeatureFalse = () => { return 'no completion'}
    ;

  function animate(selection, value, status) {
    var
      element = selection.selectAll('g .vital'),
      paths = selection.selectAll('g .line'),
      bp = selection.selectAll('g .area'),
      overlay = selection.selectAll('.overlay'),
      grouping = selection.selectAll('g.lines'),
      xScale = d3.scaleTime().domain(xDomain).range([0,width]),
      yScale = d3.scaleLinear().domain(yDomain).range([height,0]),
      filtered = element.data().filter(d => filterForYDom(d)),
      selectThis = el => d3.select(`path.${el}`),
      selectGroup = el => d3.select(`g.lines.${el}`)
      ;
    if(status){

      let change = d3.select('.nest.' + value).attr('id','fuck stephen karras');

      if(filtered.length < 1 && !single) return change;

      d3.selectAll('.nest.'+ value + ' .Select-value span.Select-value-icon').text('+');

      element.filter(d => filterOneValue(d))
        .classed('vital', false )
        .classed('vital-ns', true )
        .transition()
        .duration(500)
        .style('opacity', opacity )
        .on('end', d => {
          var lineXDom = settings.domain.x;
          translateShapes(bp, lineXDom, findFullDomain(filtered), 'area');
          translateShapes(paths, lineXDom, findFullDomain(filtered), 'line');
        });

      grouping.filter(d => filterOneValue(d))
        .selectAll('circle')
        .transition()
        .duration(500)
        .style('opacity', opacity );

    } else {
      d3.selectAll('.nest.'+ value + ' .Select-value span.Select-value-icon').text('x');

      if(value === 'abp'){
        ['sbp_art','dbp_art','abp'].forEach(e =>{
          selectIndividualPath(selectThis(e)).on('end', d => getDomainAndAnimateLines(d));
          makeCircleVisible(selectGroup(e))
        });
      }
      if(value === 'bp'){
        ['sbp','dbp','bp'].forEach(e => {
          selectIndividualPath(selectThis(e)).on('end', d => getDomainAndAnimateLines(d));
          makeCircleVisible(selectGroup(e))
        });
      }
      else
        selectIndividualPath(selectThis(value)).on('end', d => getDomainAndAnimateLines(d));
      makeCircleVisible(selectGroup(value))
    }

    const getDomainAndAnimateLines = () => {
      let
        vitals = selection.selectAll('g .vital').data(),
        lineXDom = settings.domain.x;
      translateShapes(bp, lineXDom, findFullDomain(vitals), 'area');
      translateShapes(paths, lineXDom, findFullDomain(vitals), 'line');
    }
  }

  function singular(selection, value, status) {
    let
      element = selection.selectAll(`g .vital, g .vital-ns`),
      paths = selection.selectAll('g .line'),
      bp = selection.selectAll('g .area'),
      overlay = selection.selectAll('.overlay'),
      grouping = selection.selectAll('g.lines')
      ;
    if(status){

      d3.selectAll(`.nest:not(.${value}) .Select-value span.Select-value-icon`).text('+');

      element
        .classed('vital', true)
        .classed('vital-ns', false)
        .style('opacity', d => {
          if(d['id'] === 'abp'){ return .15; }
          if(d['id'] === 'bp') { return .28; } else return 1;
        });

      grouping.filter(d => filterOneValue(d))
        .selectAll('circle')
        .style('opacity', 1);

      grouping.filter(d => filterForYDom(d))
        .selectAll('circle')
        .style('opacity', opacity);

      element.filter(d => filterForYDom(d))
        .style('opacity', opacity)
        .classed('vital', false)
        .classed('vital-ns', true)
        .transition()
        .duration(500)
        .on('start', () => {
          let
            lineXDom = settings.domain.x,
            val = selection.selectAll(`g .vital`).data();
          translateShapes(bp, lineXDom, findFullDomain(val), 'area');
          translateShapes(paths, lineXDom, findFullDomain(val), 'line');
        });

    } else {

      if(value === 'abp'){
        ['sbp_art','dbp_art','abp'].forEach(e =>{
          selectIndividualPath(e).on('end', d => getDomainAndAnimateLines(d));
          makeCircleVisible(e)
        });
      }
      if(value === 'bp'){
        ['sbp','dbp','bp'].forEach(e => {
          selectIndividualPath(e).on('end', d => getDomainAndAnimateLines(d));
          makeCircleVisible(e)
        });
      }
      selectIndividualPath(element).on('end', (d) => getDomainAndAnimateLines(d));
      makeCircleVisible(grouping)
    }

    const getDomainAndAnimateLines = () => {
      let
        vitals = selection.selectAll('g .vital, g .vital-ns').data(),
        lineXDom = settings.domain.x;
      translateShapes(bp, lineXDom, findFullDomain(vitals), 'area');
      translateShapes(paths, lineXDom, findFullDomain(vitals), 'line');
    }
  }

  function selectIndividualPath(select_these_paths) {
    if(!select_these_paths) return;
    return select_these_paths
      .classed('vital', true)
      .classed('vital-ns', false)
      .transition()
      .duration(500)
      .style('opacity', d => {
        if(d['id'] === 'abp'){ return .15; }
        if(d['id'] === 'bp') { return .28; } else return 1;
      });
  }

  function makeCircleVisible(select_this_group) {
    if(!select_this_group) return;
    return select_this_group//d3.select('g.lines.' + sign)
      .selectAll('circle')
      .transition()
      .duration(500)
      .style('opacity', 1 );
  }

  function lineInterpolation(selection, draw, opacity, completion){
    selection
      .transition()
      .on('end', d => {
        d3.select(this)
          .transition()
          .duration(2000)
          .style('opacity', opacity)
          .attrTween('d', d => {
            var
              previous = d3.select(this).attr('d'),
              current = draw(d['values'])
              ;
            return d3.interpolate(previous, current);
          });
        completion();
      });
  }

  function filterInterpolation(selection, shape){
    selection
      .transition()
      .duration(2000)
      .attrTween('d', function(d) {
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
      .attr('cy', d => Y(d) ? Y(d) : null );

    filterInterpolation(selection,shape, 0);
  }

  function findFullDomain(array){
    return [
      d3.min(array, c => d3.min(c['values'], d => d['value'])),
      d3.max(array, c => d3.max(c['values'], d => d['value']))
    ]
  }

  function findDomain(list, iteratorMin, iteratorMax){
    return [
      d3.min(list, d => d[iteratorMin]),
      d3.max(list, d => d[iteratorMax])
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
      return area.y0(Y0).y1(Y1).defined(d => valueY0(d) && valueY1(d))
    }
    if(shape === 'line'){
      return line.y(Y).defined(yValue);
    }
  }

  animate.config = function(_) {
    if(!arguments.length) return settings;
    settings = _;
    return animate;
  };

  animate.singularFilter = function(_){
    if(!arguments.length) return single;
    single = _;
    return singular;
  };

  animate.x = function(_) {
    if(!arguments.length) return xValue;
    xValue = _;
    return animate;
  };

  animate.y = function(_) {
    if(!arguments.length) return yValue;
    yValue = _;
    return animate;
  };

  animate.y0 = function(_) {
    if(!arguments.length) return valueY0;
    valueY0 = _;
    return animate;
  };

  animate.y1 = function(_) {
    if(!arguments.length) return valueY1;
    valueY1 = _;
    return animate;
  };

  animate.xDomain = function(_) {
    if(!arguments.length) return xDomain;
    xDomain = _;
    return animate;
  };

  animate.xRange = function(_) {
    if(!arguments.length) return xRng;
    xRng = _;
    return animate;
  };

  animate.yDomain = function(_) {
    if(!arguments.length) return yDomain;
    yDomain = _;
    return animate;
  };

  animate.yRange = function(_) {
    if(!arguments.length) return yRng;
    yRng = _;
    return animate;
  };

  animate.filteredYDomain = function(_) {
    if(!arguments.length) return filterForYDom;
    filterForYDom = _;
    return animate;
  };

  animate.filterIndividualValue = function(_) {
    if(!arguments.length) return filterOneValue;
    filterOneValue = _;
    return animate;
  };

  animate.visibility = function(_) {
    if(!arguments.length) return null;
    opacity = _;
    return animate;
  };

  animate.domainAccessor = function(list, min, max) {
    if(!arguments.length) return [0,100];
    return findDomain(list, min, max);
    //return keys;
  };

  animate.translator = function(selection, xDomain, yDomain, definition, draw) {
    if(!arguments.length) return translateShapes(null);
    translateShapes(selection, xDomain, yDomain, definition, draw);
    return animate;
  };

  animate.interpolator = function(selection, draw, opacity, completion){
    if(!arguments.length) return translateShapes(null);
    lineInterpolation(selection, draw, opacity, completion);
    return animate;
  };

  animate.w = function(w) {
    if(!arguments.length) return width;
    width =  w  - margin.left - margin.right;
    return animate;
  };

  animate.h = function(h) {
    if(!arguments.length) return height;
    height =  h  - margin.top - margin.bottom;
    return animate;
  };

  animate.handleUnfilteredTrue = function(_) {
    if(!arguments.length) return extendFeatureTrue;
    extendFeatureTrue = _;
    return animate;
  };

  animate.bringAllElements = function(_) {
    if(!arguments.length) return extendFeatureFalse;
    extendFeatureFalse = _;
    return animate;
  };

  return animate;

}