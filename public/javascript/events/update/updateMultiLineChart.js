const updateTimeSeries = () => {
  let
    margin = {top: 20, right: 50, bottom: 20, left: 30},
    width = 0,
    height = 0,
    line = d3.line().curve(d3.curveCardinal).x(X).y(Y),
    area = d3.area().curve(d3.curveCardinal).x(line.x()),
    xScale = d3.scaleTime(),
    yScale = d3.scaleLinear(),
    axisY = d3.axisLeft(yScale),
    axisX = d3.axisTop(xScale),
    xRng = [0,100],
    yRng = [100,0],
    xValue  = () => new Date(),
    yValue  = () => 0,
    valueY1 = () => 1,
    valueY0 = () => 0,
    settings
    ;
  const chart = selection => {
    selection.each(function(data) {
      let
        parse = (array, callback) => array.map(id => { return { id: id['id'], values: callback(id['values']) }}),
        sorted = _.sortBy(data, 'id').reverse(),
        new_data = parse(sorted, d => d)
          .filter(k => k.id !== 'sbp' && k.id !== 'dbp' && k.id !== 'sbp_art' && k.id !== 'dbp_art'),
        bp_art_data = parse(sorted, d => _.filter(d, (o, num) => o['value']))
          .filter(k => k.id === 'sbp_art' || k.id === 'dbp_art'),
        bp_data = parse(sorted, d => _.filter(d, (o, num) => o['value']))
          .filter(k => k.id === 'sbp' || k.id === 'dbp'),
        svg = d3.select(this),
        element = svg.selectAll('g .vital, g .vital-ns'),
        lines = svg.selectAll('g.lines').data(data),
        text = svg.select('g').append('text').attr('class', 'sampling-txt'),
        vitals_sel = selection.selectAll('g .vital').data(),
        vitals_keys = _.map(vitals_sel, o => o.id),
        vitals_map = _.filter(data, o => _.contains(vitals_keys, o.id)),
        start = xScale.domain()[0],
        end = xScale.domain()[1],
        result = d => filterTimeRange('date', d['values'], start, end),
        arrange = d => result(d).bottom(Infinity),
        convert = id =>  {
          if(id == 'dbp' || id == 'sbp') { return 'bp'; }
          if(id == 'dbp_art' || id == 'sbp_art') { return 'abp'; }
          else return id;
        }
        ;
      data.filter(d => {
        let
          id = convert(d.id),
          b = _.filter(d.values, o => yValue(o))
          ;
        if(!b.length){ d3.select(`.nest.${id}`).style('display', 'none');
        } else d3.select(`.nest.${id}`).style('display', 'inline-block');
      })
      ;
      yScale
        .domain([
          d3.min(vitals_map, c => d3.min(c['values'], d => d['value'])),
          d3.max(vitals_map, c => d3.max(c['values'], d => d['value']))
        ])
        .range(yRng)
      ;
      xScale
        .range(xRng)
      ;
      settings
        .domain.y = yScale.domain()
      ;
      settings
        .domain.x = xScale.domain()
      ;
      selection.select('g.axis--y')
        .transition()
        .duration(1000)
        .call(axisY)
      ;
      selection.select('g.axis--x')
        .transition()
        .duration(1000)
        .call(axisX)
      ;
      lines
        .exit()
        .attr('class', 'exit')
        .transition()
        .duration(1000)
        .attr('opacity', 0)
        .remove()
      ;
      lines
      // .transition()
      // .duration(1000)
        .selectAll('circle')
        .attr('cy', d => Y(d) ? Y(d) : null)
        .attr('cx', d => X(d) ? X(d) : null)
      ;
      element
        .each((d, i, t) => {
          let
            id = d['id'],
            that = d3.select(t[i]),
            lineDefined = line.defined(yValue),
            filtered = _.filterDropdown(new_data, 'id', id),
            filtered_bp = _.filterDropdown(bp_data, 'id', id),
            filtered_abp = _.filterDropdown(bp_art_data, 'id', id),
            areaDefined = area.defined(defineArea).y1(Y1).y0(Y0),
            c = []
            ;
          const extractDualXValues = arr => {
              arr.forEach((k,i) => k['values'].forEach(j => j[`y${i}`] = j.value));
              arr[1]['values'].forEach((itm, i ) => c.push(Object.assign({}, itm, arr[0]['values'][i])))
            }
            ;
          const interpolateShape  = (selection, arr, shape, completion)  => {
            //the following line extracts x0 and x1 values for area chart
            completion
            ;
            selection
              .data(arr)
              .transition()
              .duration(1000)
              .attrTween('d', (d, i, el) => {
                let
                  previous = d3.select(el[i]).attr('d'),
                  current = shape(arrange(d));
                return d3.interpolatePath(previous, current);
              })
          };
          if(id === 'bp') {
            interpolateShape(that, [{id: id, values: c}], areaDefined, extractDualXValues(bp_data) );
          }
          if(id === 'abp') {
            interpolateShape(that, [{id: id, values: c}], areaDefined, extractDualXValues(bp_art_data) );
          }
          else if(id === 'sbp' || id == 'dbp') {
            interpolateShape(that, [{id: id, values: filtered_bp[0]['values']}], lineDefined );
          }
          else if(id === 'sbp_art' || id == 'dbp_art') {
            interpolateShape(that, [{id: id, values: filtered_abp[0]['values']}], lineDefined );
          }
          else interpolateShape(that, filtered, lineDefined );
        })
      ;
    })
  };
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

  function findFullDomain(array){
    return [
      d3.min(array, c => d3.min(c['values'], d => d['value'])),
      d3.max(array, c => d3.max(c['values'], d => d['value']))
    ]
  }

  function excludeSegment(a, b) {
    return a.x === b.x && a.x === width; // here 300 is the max X
  }

  chart.config = function(_) {
    if(!arguments.length) return settings;
    settings = _;
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

  chart.xRange = function(_) {
    if(!arguments.length) return xRng;
    xRng = _;
    return chart;
  };

  chart.yRange = function(_) {
    if(!arguments.length) return yRng;
    yRng = _;
    return chart;
  };

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
};