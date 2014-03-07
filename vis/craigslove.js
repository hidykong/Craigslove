var w = 960;
var h = 500;

//1 = seeking; 2 = sought; 3 = orientation
var heatmap = 1;

// button             
var seeking = d3.select("#seeking")
  .on("click", function () {
      seeking.html("transition");
      heatmap = 1;
      drawChart();
  });
var sought = d3.select("#sought")
  .on("click", function () {
      seeking.html("transition");
      heatmap = 2;
      //figure out how to change color
  });
var orient = d3.select("#orient")
.on("click", function () {
      seeking.html("transition");
      heatmap = 3;
      drawChart();
  });


var projection = d3.geo.albersUsa()
.translate([w/2, h/2])
  .scale([700]);

//Define path generator
var path = d3.geo.path()
  .projection(projection);

//Define quantize scale to sort data values into buckets of color
//Coloring is off because I am using a single city's value as max rather than the state's -> will have to change later
var color = d3.scale.quantize()
  .range(["rgb(237,248,233)","rgb(186,228,179)","rgb(116,196,118)","rgb(49,163,84)","rgb(0,109,44)"]);

var radiusScale = d3.scale.linear()
        .domain([0, 100])
        .range([1, 10], 0.05);

  //Create SVG element
  var svg = d3.select("body")
  .append("svg")
  .attr("width", w)
  .attr("height", h);

  d3.csv("data/sample_state.csv", function(data) {


    d3.json("data/us-states.json", function(json) {

      //merge city info and GeoJSON
      for (var i = 0; i < data.length; i++){

          var dataState = data[i].state;
          //seeking (women/men)
            var dataValue1 = parseFloat(+data[i].w2m + +data[i].w2w)/(+data[i].m2w + +data[i].m2m);
          //sought (women/men)
            var dataValue2 = parseFloat(+data[i].m2w + +data[i].w2w)/(+data[i].m2m + +data[i].w2m);
          //orientation (homo/hetero)
            var dataValue3 = parseFloat(+data[i].m2m + +data[i].w2w)/(+data[i].m2w + +data[i].w2m);
          

        //loop through states
        for (var j= 0; j < json.features.length; j++) {
          var jsonState = json.features[j].properties.name;
          //if the State matches, store the value in json state
          if (dataState == jsonState) {
            json.features[j].properties.value1 = dataValue1;
            json.features[j].properties.value2 = dataValue2;
            json.features[j].properties.value3 = dataValue3;

            break;
          }
        }
      } //end of merge


    if (heatmap == 1){  //seeking (women/men)
      color.domain([
        d3.min(data, function(d){ return (+d.w2m + +d.w2w)/(+d.m2w + +d.m2m);}),
        d3.max(data, function(d){ return (+d.w2m + +d.w2w)/(+d.m2w + +d.m2m);})
        ]);
    } else if (heatmap == 2){ //sought (women/men)
      color.domain([
        d3.min(data, function(d){ return (+d.m2w + +d.w2w)/(+d.m2m + +d.w2m);}),
        d3.max(data, function(d){ return (+d.m2w + +d.w2w)/(+d.m2m + +d.w2m)})
        ]);
    } else if (heatmap == 3){ //orientation (homo/hetero)
      color.domain([
        d3.min(data, function(d){ return (+d.m2m + +d.w2w)/(+d.m2w + +d.w2m);}),
        d3.max(data, function(d){ return (+d.m2m + +d.w2w)/(+d.m2w + +d.w2m)})
        ]);
    }


    //this is the section we have to refactor to change later
      svg.selectAll("path")
        .data(json.features)
        .enter()
        .append("path")
        .attr("d", path)
        .style("fill", function(d){
          var value = d.properties.value1;

          if (value) {
            return color(value);
          } else {
            return "#ccc";
          }
        }); //fill


    d3.csv("data/sample_1.csv", function(data2) {
      //we can either separate state.csv or keep everything under city.
      svg.selectAll("circle")
        .data(data2)
        .enter()
        .append("circle")
        .attr("cx", function(d) {
          return projection([d.longitude, d.latitude])[0];
        })
      .attr("cy", function(d) {
        return projection([d.longitude, d.latitude])[1];
      })
      //+d turns a numeric string, d, to a number
      .attr("r", function(d) { return radiusScale(+d.w2m  +  +d.w2w  +  +d.m2m  +  +d.m2w) ; })
        .style("opacity", 0.75)
        .style("stroke-width", 0)
        //color it red when hover -> we can change this later to display the information
        .on("mouseover", function(d){
          d3.select(this)
          .attr("fill", "red");
        })
      .on("mouseout", function(d){
        d3.select(this)
        .attr("fill", "rgb(0, 0, 200)");
      });
    }); //end of city.csv

    }); //end of json = state path


  }); //end of state.csv
