!function() {
  var sunshine = {
    version: "0.0.1"
  };
  function toggleArrayItem(a, v) {
    var i = a.indexOf(v);
    if (i === -1) a.push(v); else a.splice(i, 1);
  }
  function defaultKeyAccessor(d) {
    return d.key;
  }
  function defaultValueAccessor(d) {
    return d.value;
  }
  function existsOr(object, key, otherwise) {
    if (key in object) {
      return object[key];
    }
    return otherwise;
  }
  function pieChart(config) {
    "use strict";
    config = config || {};
    var width = config.width, height = config.height, radius = 0;
    var transitionDuration = config.transitionDuration || 300, filters = config.filters || [];
    var arc = d3.svg.arc().cornerRadius(existsOr(config, "cornerRadius", 4)).innerRadius(0).outerRadius(0);
    var labelArc = d3.svg.arc();
    function calcRadius() {
      var radius = existsOr(config, "radius", Math.min(width, height) / 2 - 10);
      if (!arc.outerRadius()()) {
        arc.outerRadius(existsOr(config, "outerRadius", radius));
      }
      if (!arc.innerRadius()()) {
        arc.innerRadius(existsOr(config, "innerRadius", arc.outerRadius()() * .7));
      }
      var labelRadius = existsOr(config, "labelRadius", radius);
      labelArc.innerRadius(labelRadius).outerRadius(labelRadius);
    }
    var key = config.key || defaultKeyAccessor;
    var label = config.label || defaultKeyAccessor;
    var pie = d3.layout.pie().padAngle(existsOr(config, "padAngle", .01)).sort(config.sort || null).value(config.value || defaultValueAccessor);
    if ("startAngle" in config) {
      pie.startAngle(config.startAngle);
    }
    if ("endAngle" in config) {
      pie.endAngle(config.endAngle);
    }
    var colors = config.colors || d3.scale.category10();
    function filtersChanged() {
      console.log("filter changed", filters);
    }
    function drawLabels() {}
    function drawSlices(selection) {
      var path = selection.selectAll("path").data(pie);
      path.enter().append("path").on("mouseover", function() {
        d3.select(this).classed("mouseover", true);
      }).on("mouseout", function() {
        d3.select(this).classed("mouseover", false);
      }).on("click", function(a) {
        var k = key(a.data);
        toggleArrayItem(filters, k);
        selection.call(drawSlices);
        filtersChanged();
      });
      path.classed("unselected", function(a) {
        var k = key(a.data);
        return filters.length != 0 && filters.indexOf(k) == -1;
      });
      path.style("fill", function(d) {
        return colors(key(d.data));
      });
      path.transition().duration(transitionDuration).attrTween("d", function(a) {
        this._current = this._current || a;
        var i = d3.interpolate(this._current, a);
        this._current = i(0);
        return function(t) {
          return arc(i(t));
        };
      });
      path.exit().remove();
    }
    chart.redraw = function() {
      chart(_selection);
    };
    var _selection;
    function chart(selection) {
      _selection = selection;
      selection.each(function(data) {
        if (!width) {
          width = this.offsetWidth;
        }
        if (!height) {
          height = this.offsetHeight;
        }
        calcRadius();
        var svg = d3.select(this).selectAll("svg").data([ data ]);
        var gEnter = svg.enter().append("svg").append("g");
        svg.attr("width", width).attr("height", height);
        var g = svg.select("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
        g.call(drawSlices);
        g.call(drawLabels);
      });
    }
    d3.rebind(chart, pie, "value", "sort", "startAngle", "endAngle", "padAngle");
    d3.rebind(chart, arc, "innerRadius", "outerRadius", "cornerRadius", "padRadius");
    chart.width = function(_) {
      if (!arguments.length) return width;
      width = +_;
      return chart;
    };
    chart.filters = function(_) {
      if (!arguments.length) return filters;
      filters = _;
      return chart;
    };
    chart.height = function(_) {
      if (!arguments.length) return height;
      height = +_;
      return chart;
    };
    chart.colors = function(_) {
      if (!arguments.length) return colors;
      colors = +_;
      return chart;
    };
    chart.transitionDuration = function(_) {
      if (!arguments.length) return transitionDuration;
      transitionDuration = +_;
      return chart;
    };
    chart.labelRadius = function(_) {
      if (!arguments.length) return labelArc.innerRadius();
      labelArc.innerRadius() = +_;
      return chart;
    };
    chart.key = function(_) {
      if (!arguments.length) return key;
      key = +_;
      return chart;
    };
    return chart;
  }
  sunshine.pieChart = pieChart;
  if (typeof define === "function" && define.amd) define(sunshine); else if (typeof module === "object" && module.exports) module.exports = sunshine;
  this.sunshine = sunshine;
}();