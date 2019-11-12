function onCategoryClick() {
  var
    margin = {top: 20, right: 50, bottom: 20, left: 30},
    height = 0,
    width = 0,
    xValue  = () => new Date(),
    yValue  = () => 0,
    xDomain = [d3.timeHour.offset(new Date(),-24), new Date()],
    yDomain = [0,100],
    xRng = [0,100],
    yRng = [100,0],
    bot = null,
    cat = 'cfinal',
    ot = 1,
    descVal = () => { throw 'no description value'},
    filterForCats = d => d,
    sortForCats = d => d,
    name = () => { throw 'row class not defined'}
    ;

  function animate(selection, value, status){
    let
      row = selection.selectAll(`.rows.${name}`),
      val_replace = value.replace('/','-').replace(/\s+/g, ''),
      min_array = d3.selectAll(`.rows.${name}:not(.not-selected)`).data(),
      uniq_cats = _.uniq(min_array.map(o => o[cat]))
      ;
    if(status){
      if(uniq_cats.length < 2 && !bot) return;
      d3.selectAll(`.nest.${val_replace} .Select-value span.Select-value-icon`).text('+');

      row.filter(d => filterForCats(d))
        .classed('not-selected', true)
        .transition()
        .duration(500)
        .on('end', () => {
          let v = d3.selectAll(`.rows.${name}:not(.not-selected)`).data();
          row
            .filter(d => sortForCats(d))
            .transition()
            .duration(1000)
            .attr('transform', d => `translate(0,${ot * (_.findIndex(v, o => o === d) + 1)})`)
          ;
          row
            .filter(d => filterForCats(d))
            .transition()
            .duration(1000)
            .style('opacity', 0)
            .style('height','0px')
            .style('position', 'absolute')
            .style('left', 0)
          ;
          collapse(selection, v);
        });
    } else {
      expandAll(selection, value);
    }
  }

  function singular(selection, value, status) {
    let
      parent = selection.node().parentNode,
      row = selection.selectAll(`.rows.${name}`),
      val_replace = value.replace('/','-').replace(/\s+/g, '')
      ;
    if(status){
      d3.select(parent)
        .selectAll(`.nest:not(.${val_replace}) .Select-value span.Select-value-icon`).text('+');
      row
        .filter(d => filterForCats(d))
        .classed('not-selected', true)
        .transition()
        .duration(500)
        .on('end', () => {
          let v = _.filter(d3.selectAll(`.rows.${name}`).data(), d => sortForCats(d));
          row
            .filter(d => sortForCats(d))
            .classed('not-selected', false)
            .transition()
            .duration(1000)
            .style('opacity',1)
            .attr('transform', d => `translate(0,${ot * (_.findIndex(v, o => o === d) + 1)})`)
          ;
          row
            .filter(d => filterForCats(d))
            .transition()
            .duration(1000)
            .style('opacity', 0)
            .style('height','0px')
            .style('position', 'absolute')
            .style('left', 0)
          ;
          collapse(selection, v);
        });
    } else {
      expandAll(selection, value);
    }
  }

  function collapse(selection, v) {
    let
      parent = selection.node().parentNode,
      tl = d3.select(parent).select('.tabs-left').node().getBoundingClientRect().height + 5,
      row = selection.selectAll(`.rows.${name}`),
      right_panel = d3.select(parent.parentNode).select('div.accordion-panel')
      ;
    row
      .selectAll('.meds')
      .transition()
      .duration(500)
      .attr('fill', d => v.indexOf(d) % 2 === 0 ? '#d6d5d1' : 'white')
    ;
    selection
      .transition()
      .duration(1000)
      .attr('height', d => v.length < (30/ot) ? 150 : ot * v.length + 50)
      .attr('min-height', 100)
    ;
    console.log(v.length, ot, tl, 100 + tl, (ot * v.length + tl + 50));
    right_panel
      .transition()
      .duration(1000)
      .style('height', v.length < (30/ot) ? `${(100 + tl)}px` : `${ot * v.length + tl+50}px`)
      .style('min-height', `${(90 + tl)}px`)
    ;
  }

  function expandAll(selection, value){
    let
      val_replace = value.replace('/','-').replace(/\s+/g, ''),
      row = selection.selectAll(`.rows.${name}`)
      ;
    d3.selectAll(`.nest.${val_replace} .Select-value span.Select-value-icon`).text('x');
    row
      .filter(d => filterForCats(d))
      .classed('not-selected', false)
      .transition()
      .duration(500)
      .on('start', () => {
        let
          v = d3.selectAll(`.rows.${name}:not(.not-selected)`).data(),
          s = _.sortBy(v, o => descVal(o).toLowerCase())
          ;
        row
          .filter(d => sortForCats(d))
          .transition()
          .duration(1000)
          .attr('transform', d => `translate(0,${ot * (_.findIndex(s, o => o === d) + 1)})`)
        ;
        row
          .filter(d => filterForCats(d))
          .transition()
          .duration(1000)
          .attr('transform', d => `translate(0,${ot * (_.findIndex(s, o => o === d) + 1)})`)
          .style('opacity', 1)
          .style('height','0px')
          .style('position', 'absolute')
          .style('left', 0)
        ;
        collapse(selection, s);
      });
  }

  animate.singularFilter = function(_){
    if(!arguments.length) return bot;
    bot = _;
    return singular;
  };

  animate.category = function(_) {
    if(!arguments.length) return cat;
    cat = _;
    return animate;
  };

  animate.dValue = function(_) {
    if(!arguments.length) return descVal;
    descVal = _;
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

  animate.xDomain = function(_) {
    if(!arguments.length) return xDomain;
    xDomain = _;
    return animate;
  };

  animate.yDomain = function(_) {
    if(!arguments.length) return yDomain;
    yDomain = _;
    return animate;
  };

  animate.xRange = function(_) {
    if(!arguments.length) return xRng;
    xRng = _;
    return animate;
  };

  animate.yRange = function(_) {
    if(!arguments.length) return yRng;
    yRng = _;
    return animate;
  };

  animate.sortBy = function(_) {
    if(!arguments.length) return sortForCats;
    sortForCats = _;
    return animate;
  };

  animate.filterCategories = function(_) {
    if(!arguments.length) return filterForCats;
    filterForCats = _;
    return animate;
  };

  animate.nameRow = function(_){
    if(!arguments.length) return name;
    name = _;
    return animate;
  };

  animate.offsetRow = function(_) {
    if(!arguments.length) return ot;
    ot = _;
    return animate;
  };

  return animate;
}