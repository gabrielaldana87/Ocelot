function timelineBars() {
  var
    margin = {top: 20, right: 50, bottom: 20, left: 30},
    xScale = d3.scaleTime(),
    yScale = d3.scaleLinear(),
    cScale = d3.scaleSequential(d3.interpolateViridis),
    area = d3.area().curve(d3.curveCardinal),
    setData = () => { throw 'no dataset defined';},
    descVal = () => { throw 'no description value';},
    xValue = () => new Date(),
    xPlus = () => new Date(),
    yValue = () => 0,
    xAxis = d3.axisTop(xScale),
    yAxis = d3.axisLeft(yScale).ticks(0),
    width = 0,
    height = 0,
    offset = 1,
    accessor = d => d,
    accessorMeds = () => { throw 'no meds accessor'; },
    accessorText = () => { throw 'no meds unit of measure'; },
    renderElement = () => { throw 'no shape rendering function'; },
    rowClass = () => { throw 'row class not named'; }
    ;

  function chart(selection) {
    selection.each(function(data) {
      var
        svg = d3.select(this).classed('view',true).attr('height',(data.length * offset) + 45),
        g = svg.select('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')'),
        groups = _.sortBy(data, o => descVal(o).toLowerCase() )
        ;

      xScale.range([0, width]);
      yScale.range([height, 0]);

      g.append('g')
        .attr('class', 'axis axis--x')
        .attr('transform', 'translate(0,' + 0 + ')')
        .call(xAxis);

      var
        rows = g.selectAll('.rows')
          .data(groups)
          .enter()
          .append('g')
          .attr('class',`rows ${rowClass}`)
          .attr('transform', (d,i) => `translate(0,${offset * (i +1)})`)
          .attr('id', d => descVal(d) );
      rows
        .append('rect')
        .attr('class','meds')
        .attr('x', 0)
        .attr('y', -offset)
        .attr('width', width)
        .attr('height', offset)
        .attr('fill', (d,i) => (i % 2) === 0 ? '#d6d5d1' : 'white')
        .attr('opacity', .50)
        .attr('rx','4px');
      rows
        .append('text')
        .text(d => descVal(d) )
        .attr('class','drug')
        .attr('font-size','10px')
        .attr('font-weight', 600)
        .attr('transform','translate(15,-4)')
        .style('fill','#555');

      rows.append('g')
        .attr('class', 'axis axis--y')
        .attr('transform', () => 'translate(' + -5 + ',' + 0 + ')' );
      // .call(yAxis);

      rows.each(function(d,i){
        var
          row = d3.select(this),
          txt_length = row.select('.drug').node().getComputedTextLength(),
          tasks = accessorMeds(row.data()[0]),
          yDom = [0, d3.max(tasks, d => d.dose ? d.dose : 1)],
          index = i
          ;
        yScale.range([0,13]).domain(yDom);
        cScale.domain([0, groups.length]);
        row
          .selectAll('.task')
          .data(d => d.tasks ? setData(d) : row.data())
          .enter()
          .append(renderElement)
          .attr('class','task')
          .attr('y',-15)
          .attr('x', d => X(d) )
          .attr('width', d => xScale(xPlus(d)) - X(d) )
          .attr('transform', d => d.doses ? `translate(0,-23)`: null )
          .attr('stroke', d => d.doses ? cScale(index) : 'none')
          .attr('stroke-width', 2)
          .attr('stroke-opacity',1)
          .attr('fill', (d,i) => d.doses ?  cScale(index) : 'steelblue')
          .attr('fill-opacity', d => d.doses ? .15 : 1)
          .attr('height', d => d.maxdosage ? (d.dose/d.maxdosage) * 14 : 14 )
          .attr('d', d => d.doses ?
            area.defined( d => d.interval < 2 && d.dose)
              .x(d => X(d))
              .y0(d => Y1(d))
              .y1(d => -Y1(d))(tasks) : null)
        ;
        var
          dose = row
            .selectAll('.dose')
            .data(d => accessorMeds(d) )
            .enter()
            .append('text')
            .attr('class', d => d.doseunit ? 'drip dose' : 'med dose')
            .text(d => accessorText(d) )
            .attr('dx', d => X(d) + 5 )
            .attr('dy', d => d.doseunit ? 0: -5)
            .attr('fill', '#656565')
            .attr('font-size','8px')
            .attr('letter-spacing','1px')
            .attr('font-weight','600')
            .attr('font-family','Avenir Next'),
          task_data = dose.data();
        dose
          .style('opacity',function(d,i){
            if(X(d) <= txt_length ){ return 0; }
            if(i+1 < task_data.length) {
              if(X(d) + this.getComputedTextLength() >= X(task_data[i+1])) {
                return 0;
              } else return 1;
            }
          });
      });
    });
  }

  // The x-accessor for the path generator; xScale ∘ xValue.
  function X(d) {
    return xScale(xValue(d));
  }

  function Y0(d) {
    return yScale(0);
  }

  function Y1(d) {
    return yScale(yValue(d));
  }

  chart.dataset = function(_){
    if(!arguments.length) return setData;
    setData = _;
    return chart;
  };

  chart.dValue = function(_) {
    if(!arguments.length) return descVal;
    descVal = _;
    return chart;
  };

  chart.x0 = function(_) {
    if(!arguments.length) return xValue;
    xValue = _;
    return chart;
  };

  chart.x1 = function(_) {
    if(!arguments.length) return xPlus;
    xPlus = _;
    return chart;
  };

  chart.y = function(_) {
    if(!arguments.length) return yValue;
    yValue = _;
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

  chart.offsetRow = function(_) {
    if(!arguments.length) return offset;
    offset = _;
    return chart;
  };

  chart.objectAccessor = function(_){
    if(!arguments.length) return accessor;
    accessor = function(d){
      return d[_];
    };
    return chart;
  };

  chart.arrayAccessor = function(_){
    if(!arguments.length) return accessorMeds;
    accessorMeds = _;
    return chart;
  };

  chart.nameRow = function(_){
    if(!arguments.length) return rowClass;
    rowClass = _;
    return chart;
  };

  chart.textUOM = function(_) {
    if(!arguments.length) return accessorText;
    accessorText = _;
    return chart;
  };

  chart.elements = function(_) {
    if(!arguments.length) return renderElement;
    renderElement = _;
    return chart;
  };

  return chart;
}