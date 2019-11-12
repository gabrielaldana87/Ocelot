var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var IntervalLabel = function IntervalLabel() {
  return React.createElement(
    'div',
    { className: 'pill floating info title-row', style: { width: '33%', padding: '1em', whiteSpace: 'normal' } },
    React.createElement(
      'div',
      null,
      '24 HOUR SUMMARY'
    )
  );
};

var ArrowSymbol = function ArrowSymbol(props) {
  if (props.value) {
    return props.value;
  } else return React.createElement('text', null);
};

var Arrow = function Arrow(props) {
  var days = props.width - 1,
    style = props.value.style,
    id = props.value.id,
    maxDt = props.maxDt,
    wkOffsetDt = d4.timeHour.offset(maxDt, -24 * days),
    now = new Date(),
    wkAgoDt = d4.timeHour.offset(now, -24 * days),
    midnight = new Date(d4.timeFormat("%m/%d/%Y")(now)),
    currDt = d4.timeHour.offset(maxDt, -props.period),
    prevDt = d4.timeHour.offset(maxDt, -(props.period + 24)),
    conditionDt = function conditionDt(id) {
      if (id === 'Forward') {
        return currDt;
      }
      if (id === 'Back') {
        return prevDt;
      } else return '';
    },
    todayButton = React.createElement(
      'span',
      { style: { display: 'contents' } },
      React.createElement(
        'span',
        null,
        'TODAY'
      )
    ),
    startButton = React.createElement(
      'span',
      { style: { display: 'contents' } },
      React.createElement(
        'span',
        null,
        'START'
      )
    ),
    yestrButton = React.createElement(
      'span',
      { style: { display: 'contents' } },
      React.createElement(
        'span',
        null,
        'YESTERDAY'
      )
    ),
    arrowButton = React.createElement(
      'span',
      { className: 'Select-arrow-zone', style: style,
        onClick: props.onClick },
      React.createElement('span', { className: 'Select-arrow' })
    ),
    conditionHr = function conditionHr(id) {
      var offsetDt = d4.timeHour.offset(conditionDt(id), 24);
      switch (id) {
      case 'Forward':
        if (maxDt) {
          if (offsetDt >= now && maxDt.getTime() === offsetDt.getTime()) {
            return todayButton;
          }
          if (offsetDt < now && maxDt.getTime() > offsetDt.getTime()) {
            return arrowButton;
          }
          if (offsetDt < now && maxDt.getTime() === offsetDt.getTime()) {
            return yestrButton;
          }
        }
        break;
      case 'Back':
        if (wkOffsetDt) {
          //   console.log(`offsetDt ${offsetDt}\twkAgoDt ${wkAgoDt}\twkOffsetDt ${wkOffsetDt}`);
          if (offsetDt <= wkAgoDt && wkOffsetDt.getTime() === offsetDt.getTime()) {
            return todayButton;
          }
          if (offsetDt > wkAgoDt && wkOffsetDt.getTime() < offsetDt.getTime()) {
            return arrowButton;
          }
          if (offsetDt > wkAgoDt && wkOffsetDt.getTime() === offsetDt.getTime()) {
            return startButton;
          }
        }
        break;
      default:
        return '';
      }
    };
  return React.createElement(
    'div',
    { className: 'pill floating info title-row', style: { width: '33%', padding: '1em' } },
    React.createElement(ArrowSymbol, {
      value: conditionHr(id)
    })
  );
};

var Header = function Header(props) {
  return React.createElement(
    'div',
    { className: 'pill floating info title-row', style: { width: '32%' } },
    props.value
  );
};

var Time = function Time(props) {
  if (props.value) {
    return React.createElement(
      'text',
      { id: 'T'.concat(range_tm) },
      d4.timeFormat("%a %m/%d")(props.value)
    );
  } else return React.createElement('text', null);
};

var TimeFrames = function TimeFrames(props) {
  var id = props.value.id,
    now = new Date(),
    maxDt = d4.max(props.data, function (d) {
      return new Date(d['enddtm']);
    }),
    currDt = d4.timeHour.offset(maxDt, -props.period),
    prevDt = d4.timeHour.offset(maxDt, -(props.period + 24)),
    conditionDt = function conditionDt(id) {
      if (id === 'Today') {
        return currDt;
      }
      if (id === 'Yesterday') {
        return prevDt;
      } else return '';
    },
    conditionHr = function conditionHr(dt) {
      if (!dt) {
        return;
      }
      if (d4.timeHour.offset(dt, 24) >= now) {
        return '7AM - ' + d4.timeFormat('%_I %p')(now);
      }
      if (d4.timeHour.offset(dt, 24) < now) {
        return '7AM - 7AM';
      }
    };
  return React.createElement(
    'div',
    { className: 'pill floating info right', style: { width: '32%' } },
    React.createElement(
      'p',
      { className: 'desc cursor-day range' },
      React.createElement(Time, {
        value: conditionDt(id) })
    ),
    React.createElement(
      'p',
      { className: 'desc' },
      conditionHr(conditionDt(id))
    )
  );
};

var Totals = function Totals(props) {
  var array = props.functionId ? props.parse[props.functionId](props) : [1, 2];
  var mapper = array.map(function (r) {
    return React.createElement(
      'p',
      { className: 'inner-nums', key: r },
      r
    );
  });
  return React.createElement(
    'div',
    null,
    mapper
  );
};

var RightPanel = function (_React$Component) {
  _inherits(RightPanel, _React$Component);

  function RightPanel(props) {
    _classCallCheck(this, RightPanel);

    var _this = _possibleConstructorReturn(this, (RightPanel.__proto__ || Object.getPrototypeOf(RightPanel)).call(this, props));

    _initialiseProps.call(_this);

    _this.state = {
      results: [],
      path: '',
      count: 0,
      period: null,
      functionId: '',
      containerId: '',
      time: ''
    };
    return _this;
  }

  _createClass(RightPanel, [{
    key: 'render',
    value: function render() {
      return React.createElement(
        'div',
        { ref: this.getSummary },
        React.createElement(
          'div',
          { className: 'tabs-left' },
          React.createElement(
            'div',
            { className: 'row' },
            React.createElement(
              'div',
              null,
              React.createElement(IntervalLabel, null),
              React.createElement(
                'div',
                null,
                this.renderArrows(this.props.arrows)
              )
            )
          )
        ),
        React.createElement(
          'div',
          { className: 'first-panel' },
          React.createElement(
            'div',
            { className: 'tabs-header' },
            React.createElement(
              'div',
              { className: 'row' },
              this.renderTimeLabels(this.props.times)
            )
          ),
          React.createElement(
            'div',
            null,
            this.renderRows(this.props.measures)
          )
        )
      );
    }
  }]);

  return RightPanel;
}(React.Component);

var _initialiseProps = function _initialiseProps() {
  var _this2 = this;

  this.componentDidMount = function () {
    _this2.getSummary();
    _this2.setState({
      functionId: _this2.props.functionId,
      containerId: ReactDOM.findDOMNode(_this2).parentNode.getAttribute('id')
    });
  };

  this.getSummary = function () {
    return _this2.populateTable();
  };

  this.parseVitals = function (props) {
    var summary = [];
    if (props.results) {
      var max = d4.max(props.results, function (d) {
        return new Date(d['enddtm']);
      });
      props.results.filter(function (r) {
        var twentyfour = d4.timeHour.offset(max, -props.period),
          within = new Date(r.startdtm);
        if (new Date(r.enddtm) > twentyfour && twentyfour.getTime() === within.getTime()) {
          var vital = props.id === 'spo2' ? 'SpO2' : props.id.toUpperCase(),
            min = r[vital + 'Min'] ? r[vital + 'Min'].toString() : ' ',
            _max = r[vital + 'Max'] ? r[vital + 'Max'].toString() : ' ';
          summary.push(min + ' - ' + _max);
        }
      });
    }
    return summary;
  };

  this.parseIOs = function (props) {
    var summary = [];
    if (props.results) {
      var max = d4.max(props.results, function (d) {
        return new Date(d['enddtm']);
      });
      props.results.filter(function (r) {
        var twentyfour = d4.timeHour.offset(max, -props.period),
          //d4.timeHour.offset(new Date(),-24);
          within = new Date(r.startdtm);
        if (new Date(r.enddtm) > twentyfour && twentyfour.getTime() === within.getTime()) {
          summary.push(r[props.id].toString());
        }
      });
    }
    return summary;
  };

  this.parseBPs = function (props) {
    var summary = [];
    if (props.results) {
      var max = d4.max(props.results, function (d) {
        return new Date(d['enddtm']);
      });
      props.results.filter(function (r) {
        var twentyfour = d4.timeHour.offset(max, -props.period),
          within = new Date(r.startdtm);
        if (new Date(r.enddtm) > twentyfour && twentyfour.getTime() === within.getTime() && props.id === 'bp') {
          var sbpMin = r['SBPMin'] ? r['SBPMin'].toString() : null,
            sbpMax = r['SBPMax'] ? r['SBPMax'].toString() : null,
            dbpMin = r['DBPMin'] ? r['DBPMin'].toString() : null,
            dbpMax = r['DBPMax'] ? r['DBPMax'].toString() : null,
            min = sbpMin ? sbpMin + '/' + dbpMin : ' ',
            _max2 = sbpMax ? sbpMax + '/' + dbpMax : ' ';
          summary.push(min + ' - ' + _max2);
        }
        if (new Date(r.enddtm) > twentyfour && twentyfour.getTime() === within.getTime() && props.id === 'abp') {
          var _sbpMin = r['SBPMin_art'] ? r['SBPMin_art'].toString() : null,
            _sbpMax = r['SBPMax_art'] ? r['SBPMax_art'].toString() : null,
            _dbpMin = r['DBPMin_art'] ? r['DBPMin_art'].toString() : null,
            _dbpMax = r['DBPMax_art'] ? r['DBPMax_art'].toString() : null,
            _min = _sbpMin ? _sbpMin + '/' + _dbpMin : ' ',
            _max3 = _sbpMax ? _sbpMax + '/' + _dbpMax : ' ';
          summary.push(_min + ' - ' + _max3);
        }
      });
    }
    return summary;
  };

  this.populateTable = function () {
    var data = _this2.props.path;
    var period = _this2.props.period;
    _this2.setState({
      results: data,
      period: period
    });
  };

  this.onValueClick = function (mv) {
    _this2.setState({
      count: _this2.state.count + mv,
      period: (_this2.state.count + (mv + 1)) * 24
    });
  };

  this.renderArrows = function (arrowValues) {
    return arrowValues.map(function (value, i) {
      var maxDt = d4.max(_this2.state.results, function (d) {
          return new Date(d['enddtm']);
        }),
        arrLength = _this2.state.results.length;
      return React.createElement(Arrow, {
        value: value,
        period: _this2.state.period,
        maxDt: maxDt,
        width: arrLength,
        onClick: function onClick() {
          return _this2.onValueClick(value.movement);
        }
      });
    });
  };

  this.renderHeaders = function (headerValues) {
    return headerValues.map(function (value, i) {
      return React.createElement(
        'div',
        null,
        React.createElement(Header, { value: value })
      );
    });
  };

  this.renderTimeLabels = function (labelValues) {
    return labelValues.map(function (value, i) {
      return React.createElement(
        'div',
        null,
        React.createElement(TimeFrames, {
          value: value,
          data: _this2.state.results,
          period: _this2.state.period
        })
      );
    });
  };

  this.renderRows = function (measureValues) {
    return measureValues.map(function (value, i) {
      return React.createElement(
        'div',
        { className: 'row-table' },
        React.createElement(
          'div',
          { className: 'pill floating info header', id: value.id, style: { width: '32%' } },
          value.id
        ),
        React.createElement(
          'div',
          { className: 'pill floating info range', id: value.id, style: { width: '32%' } },
          React.createElement(Totals, {
            results: _this2.state.results,
            id: value.id,
            parse: { first: _this2.parseIOs, second: _this2.parseVitals, third: _this2.parseBPs },
            functionId: value.functionId,
            period: _this2.state.period + 24,
            count: _this2.state.count
          })
        ),
        React.createElement(
          'div',
          { className: 'pill floating info current', id: value.id, style: { width: '32%' } },
          React.createElement(Totals, {
            results: _this2.state.results,
            id: value.id,
            parse: { first: _this2.parseIOs, second: _this2.parseVitals, third: _this2.parseBPs },
            functionId: value.functionId,
            period: _this2.state.period,
            count: _this2.state.count
          })
        )
      );
    });
  };
};