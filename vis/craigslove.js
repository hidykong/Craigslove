var w = 960;
var h = 500;

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

  //Create SVG element
  var svg = d3.select("body")
  .append("svg")
  .attr("width", w)
  .attr("height", h);

  d3.csv("data/sample_format.csv", function(data) {
    color.domain([
      //use w2m to determine the color for now
      d3.min(data, function(d){ return d.w2m;}),
      d3.max(data, function(d){ return d.w2m;})
      ]);

    d3.json("data/us-states.json", function(json) {

      //merge city info and GeoJSON
      for (var i = 0; i < data.length; i++){
        var dataState = data[i].state;
        var dataValue = parseFloat(data[i].w2m);

        //loop through states
        for (var j= 0; j < json.features.length; j++) {
          var jsonState = json.features[j].properties.name;
          //if the State matches, store the value in json state
          if (dataState == jsonState) {
            //if there is already a value for that State, add to the value
            if (json.features[j].properties.value){
              json.features[j].properties.value += dataValue;
            }
            else { json.features[j].properties.value = dataValue;}

            break;
          }
        }
      }

      svg.selectAll("path")
        .data(json.features)
        .enter()
        .append("path")
        .attr("d", path)
        .style("fill", function(d){
          var value = d.properties.value;

          if (value) {
            return color(value);
          } else {
            return "#ccc";
          }
        });

      //we can either separate state.csv or keep everything under city.
      svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function(d) {
          return projection([d.longitude, d.latitude])[0];
        })
      .attr("cy", function(d) {
        return projection([d.longitude, d.latitude])[1];
      })
      .attr("r", 5)
        .style("opacity", 0.75)
        //color it red when hover -> we can change this later to display the information
        .on("mouseover", function(d){
          d3.select(this)
          .attr("fill", "red");
        })
      .on("mouseout", function(d){
        d3.select(this)
        .attr("fill", "rgb(0, 0, 200)");
      });
    });
  }); //end of csv
