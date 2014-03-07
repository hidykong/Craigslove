var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var formatPercent = d3.format(".0%");

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1, 1);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("data/sample_format.csv", function(error, data) {

  currentCity = "Ludlow";

  var ob;

  for ( i in data ){
    if (data[i]['city'] == "Ludlow") {
      ob = data[i];
    }
  }

  xDom = ["m4m","m4w","w4m","w4w"];
  yvals = [ {"tag":"m4m","val":ob["m4m"]},
            {"tag":"m4w","val":ob["m4w"]},
            {"tag":"w4m","val":ob["w4m"]},
            {"tag":"w4w","val":ob["w4w"]} ];



  data.forEach(function(d) {
    d.frequency = +d.frequency;
  });
  var mmv = d3.max(yvals, function(d) { return parseInt(d.val,10); })
  x.domain(xDom);
  y.domain([0,mmv]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Frequency");

  svg.selectAll(".bar")
      .data(yvals)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.tag); })
      .attr("width", x.rangeBand())
      .attr("y", function(d) { return y(d.val); })
      .attr("height", function(d) { return height - y(d.val); });

  d3.select("input").on("change", change);

  var sortTimeout = setTimeout(function() {
    d3.select("input").property("checked", true).each(change);
  }, 1000);

  function change() {
    clearTimeout(sortTimeout);
    currentCity = "Lawndale";

    var ob;

    for ( i in data ){
      if (data[i]['city'] == currentCity) {
        ob = data[i];
      }
    }

  yvals = [ {"tag":"m4m","val":ob["m4m"]},
            {"tag":"m4w","val":ob["m4w"]},
            {"tag":"w4m","val":ob["w4m"]},
            {"tag":"w4w","val":ob["w4w"]} ];

    // Copy-on-write since tweens are evaluated after a delay.
    var x0 = x.domain(data.sort(this.checked
        ? function(a, b) { return b.frequency - a.frequency; }
        : function(a, b) { return d3.ascending(a.letter, b.letter); })
        .map(function(d) { return d.letter; }))
        .copy();

    var transition = svg.transition().duration(1000),
        delay = function(d, i) { return i * 50; };

    //transition.selectAll(".bar")
        //.delay(delay)
        //.attr("height", function(d) { return height - y(d.val); });

    svg.selectAll(".bar")
      .data(yvals)
    .transition()
      .duration(1000)
      .attr("height", function(d) { return height - y(d.val); })
      .attr("y", function(d) { return y(d.val); })

  }
});
