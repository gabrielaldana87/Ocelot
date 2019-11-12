const onClickOfInOutCell = () => {
  let
    margin = {top: 20, right: 50, bottom: 20, left: 30},
    filterOneValue = d => d,
    rejectValue = d => !d,
    stack = () => { throw 'no stack has been defined'}
    ;
  const animate = (selection, value, status) => {
      selection.each( (data, i, t) => {
        let
          view = d3.select(t[i]),
          w = +view.attr('width') - margin.top - margin.bottom,
          h = +view.attr('height') - margin.left - margin.right,
          yScale = d3.scaleLinear().range([h, 0]),
          bars = view.selectAll('.bars'),
          series = bars.data(),
          xAxis = view.select('g.axis--x'),
          yAxis = view.select('g.axis--y')
          ;
        if(status){
          bars
            .filter(d => filterOneValue(d))
            .attr('class', 'bars selected')
            .each( (d, i, t) => {
              let
                inner = d3.select(t[i]).selectAll('rect'),
                values = _.map(d, d => d['data'][value]),
                outflow = d3.min(values),
                extent = d3.max(values)
                ;
              switch (true) {
              case (extent > 0):
                yScale.domain([0, extent])
                ;
                xAxis
                  .transition()
                  .duration(500)
                  .attr('transform',`translate(0,${h})`)
                ;
                inner
                  .transition()
                  .duration(500)
                  .attr('height', d => d[0] >= 0 ? yScale(d[0]) - yScale(d[1]) : 0 )
                  .attr('y', d => d[0] < 0 ? yScale(0) : yScale(0) - (yScale(d[0]) - yScale(d[1])))
                ;
                break;
              case (outflow < 0):
                yScale.domain([outflow, 0])
                ;
                xAxis
                  .transition()
                  .duration(500)
                  .attr('transform','translate(0,0)')
                ;
                inner
                  .transition()
                  .duration(500)
                  .attr('height', d => d[0] < 0 ? yScale(d[0]) - yScale(d[1]) : 0)
                  .attr('y', 0)
                ;
                break;
              }
            });
          bars
            .filter(d => rejectValue(d))
            .each( (d, i, t) => {
              let inner = d3.select(t[i]).selectAll('rect');
              inner
                .transition()
                .duration(500)
                .attr('y', 0)
                .attr('height', 0);
            })
          ;
          yAxis
            .transition()
            .duration(500)
            .call(d3.axisLeft(yScale))
          ;
        } else {

          yScale
            .domain([d3.min(series, stackMin), d3.max(series, stackMax)])
            .range([h, 0])
          ;
          bars
            .transition()
            .duration(500)
            .each((d, i, t) => {
              d3.select(t[i])
                .selectAll('rect')
                .data(d => d)
                .transition()
                .duration(500)
                .attr('y', d => yScale(d[1]))
                .attr('height', d => yScale(d[0]) - yScale(d[1]) )
            })
          ;
          xAxis
            .transition()
            .duration(500)
            .attr('transform', `translate(0,${yScale(0)})`)
          ;
          yAxis
            .transition()
            .duration(500)
            .call(d3.axisLeft(yScale))

        }
      })
    }
    ;
  const stackMin = ser => d3.min(ser, d => d[0])
    ;
  const stackMax = ser => d3.max(ser, d => d[1])
    ;
  animate.filterIndividualValue = function(_) {
    if(!arguments.length) return filterOneValue;
    filterOneValue = _;
    return animate;
  }
  ;
  animate.rejectIndividualValue = function(_) {
    if(!arguments.length) return rejectValue;
    rejectValue = _;
    return animate;
  }
  ;
  animate.createStack = function(completion) {
    if(!arguments.length) return stack;
    stack = completion();
    return animate;
  }
  ;
  return animate;
};