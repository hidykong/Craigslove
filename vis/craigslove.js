var w = 2000;
var h = 800;

var margin = {top: 20, right: 80, bottom: 100, left: 80},
    width = w - margin.left - margin.right,
    height = h - margin.top - margin.bottom;

var mapXOffset=700;
var barHeight = height*0.4;
var barXoffset=1250;
var barYoffset=150;
var wordListXoffset=barXoffset+(width*0.15*0.5);
var wordListYoffset=barYoffset+barHeight+80;
var labelXoffset=barXoffset+(width*0.15*0.5);
var labelYoffset=barYoffset-20;
var formatPercent = d3.format(".0%");

var x = d3.scale.ordinal()
  .rangeRoundBands([0, width*0.15], .1, 1);

var y = d3.scale.linear()
  .range([barHeight, 0]);

  var xAxis = d3.svg.axis()
.scale(x)
  .orient("bottom");

  var yAxis = d3.svg.axis()
.scale(y)
  .orient("left");

  var svg = d3.select("body").append("svg")
  .attr("class","chart")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  //1 = seeking; 2 = sought; 3 = orientation
  var heatmap = 1;
  var logValue = 1;

  var projection = d3.geo.albersUsa()
.translate([mapXOffset, h/2])
  .scale([1300]);

  //Define path generator
var path = d3.geo.path()
  .projection(projection);

  //Define quantize scale to sort data values into buckets of color
  //Coloring is off because I am using a single city's value as max rather than the state's -> will have to change later
var color1 = d3.scale.linear()
  .range (["rgb(0,27,137)","rgb(251,20,71)"]);
var color2 = d3.scale.linear()
  .range (["rgb(81,167,249)", "rgb(222,106,16)"]);
var color3 = d3.scale.linear()
  .range (["rgb(218,179,114)","rgb(113,37,117)"]);

  var radiusScale = d3.scale.linear()
.domain([0, 2000])
  .range([2, 5], 0.05);

  //Create SVG element

  d3.csv("data/better_output_state.csv", function(data) {

    d3.json("data/us-states.json", function(json) {

      d3.csv("data/better_city_output2.csv", function(data2) {

        //Make buttons
        buttonData = [ {"name":"seeking","first":"men","second":"women","color1":"#fb1447","color2":"#001B89"},
                       {"name":"sought","first":"men","second":"women","color1":"#51A7F9","color2":"#DE6A10"},
                       {"name":"orientation","first":"same","second":"opposite","color1":"#DAB372","color2":"#712575"}];

      for ( i in buttonData ) {
        var gradient = svg.append("svg:defs")
        .append("svg:linearGradient")
        .attr("id", "gradient"+i)
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%")
        .attr("spreadMethod", "pad");

      gradient.append("svg:stop")
        .attr("offset", "0%")
        .attr("stop-color", buttonData[i]["color1"])
        .attr("stop-opacity", 1);

      gradient.append("svg:stop")
        .attr("offset", "100%")
        .attr("stop-color", buttonData[i]["color2"])
        .attr("stop-opacity", 1);
      }

        //you can delete the US portion since we're not using it.
        usaOb = data[data.length-1];
        USratio1 = parseFloat(+usaOb.w4m + +usaOb.w4w)/(+usaOb.m4w + +usaOb.m4m);
        USratio2 = parseFloat(+usaOb.m4w + +usaOb.w4w)/(+usaOb.m4m + +usaOb.w4m);
        USratio3 = parseFloat(+usaOb.m4m + +usaOb.w4w)/(+usaOb.m4w + +usaOb.w4m);
        //delete till here

        //keep track of mins and maxs
        minRatio1 = 0;
        minRatio2 = 0;
        minRatio3 = 0;

        maxRatio1 = 0;
        maxRatio2 = 0;
        maxRatio3 = 0;

        //merge state info and GeoJSON
        for (var i = 0; i < data.length; i++){

          var dataState = data[i].city;
          //seeking (women/men)
          var dataValue1 = parseFloat(+data[i].w4m + +data[i].w4w)/(+data[i].m4w + +data[i].m4m);
          //dataValue1 = dataValue1 - USratio1;
          //sought (women/men)
          var dataValue2 = parseFloat(+data[i].m4w + +data[i].w4w)/(+data[i].m4m + +data[i].w4m);
          //dataValue2 = dataValue2 - USratio2;
          //orientation (homo/hetero)
          var dataValue3 = parseFloat(+data[i].m4m + +data[i].w4w)/(+data[i].m4w + +data[i].w4m);
          //dataValue3 = dataValue3 - USratio3;

          minRatio1 = d3.min([minRatio1, dataValue1]);
          minRatio2 = d3.min([minRatio2, dataValue2]);
          minRatio3 = d3.min([minRatio3, dataValue3]);

          maxRatio1 = d3.max([maxRatio1, dataValue1]);
          maxRatio2 = d3.max([maxRatio2, dataValue2]);
          maxRatio3 = d3.max([maxRatio3, dataValue3]);

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

        //finding the furthest point from the average
        /*
        rangeRatio1 = d3.max([Math.abs(minRatio1), Math.abs(maxRatio1)]);
        rangeRatio2 = d3.max([Math.abs(minRatio2), Math.abs(maxRatio2)]);
        rangeRatio3 = d3.max([Math.abs(minRatio3), Math.abs(maxRatio3)]);
        */

        //seeking (women/men)
        color1.domain([minRatio1, maxRatio1]);
        //color1.domain([-rangeRatio1, rangeRatio1]); //puts the mean in the center of the color scale
        //sought (women/men)
        color2.domain([minRatio2, maxRatio2]);
        //orientation (homo/hetero)
        color3.domain([minRatio3, maxRatio3]);

        //this is the section we have to refactor to change later
        svg.selectAll("path")
          .data(json.features)
          .enter()
          .append("path")
          .attr("d", path)
          .on("click",function(d){return change("state",d.properties.name);})
          .style("opacity","0")
          .on("mouseover", function(d){
            d3.select(this)
            .transition()
            .duration(100)
            .style("fill", function() {
              return d3.rgb(d3.select(this).style("fill")).brighter(2);
            });
          })
          .on("mouseout", function(d){
            d3.select(this)
            .transition()
            .duration(100)
            .style("fill", function(d){
            if (heatmap == 1) {
              return color1(d.properties.value1);
            } else if (heatmap == 2) {
              return color2(d.properties.value2);
            } else if (heatmap == 3) {
              return color3(d.properties.value3);
            }
          });
          })

          .style("fill", function(d){
            var value = d.properties.value1;

            if (value) {
              return color1(value);
            } else {
              return "#ccc";
            }
          });//fill
        svg.selectAll("path")
          .transition()
          // This should be i*30
          .delay(function(d,i) { return i*30;})
          .duration(1000)
          .style("opacity","1");

        //circle for the cities
        svg.selectAll("circle")
          .data(data2)
          .enter()
          .append("circle")
          .attr("class","cityCircle")
          .attr("cx", function(d) {
            return projection([d.lon, d.lat])[0];
          })
        .attr("cy", function(d) {
          return projection([d.lon, d.lat])[1];
        })
        //+d turns a numeric string, d, to a number
        .attr("r", function(d) { return radiusScale(+d.w4m  +  +d.w4w  +  +d.m4m  +  +d.m4w) ; })
          .style("opacity", 0.75)
          .style("stroke-width", 0)
          //color it red when hover -> we can change this later to display the information
          .on("mouseover", function(d){
            d3.select(this)
          .transition()
          .duration(100)
            .style("fill", "#676767");
          })
        .on("mouseout", function(d){
          d3.select(this)
          .transition()
          .duration(100)
          .style("fill", "#000000");
        })
        .on("click",function(d){return change("city",d);}).style("opacity","0");


        svg.selectAll(".cityCircle")
          .transition()
          // 2000 
          .delay(2000)
          .duration(500)
          .style("opacity","1");
        // buttons         
        var seeking = d3.select("#seeking")
          .on("click", function () {
            drawMap(1);
          });
        var sought = d3.select("#sought")
          .on("click", function () {
            drawMap(2);
          });
        var orient = d3.select("#orient")
          .on("click", function () {
            drawMap(3);
          });

      var selectorButtonheight = 100;
      svg.selectAll(".selectorButtons")
        .data(buttonData)
        .enter()
        .append("rect")
        .attr("class","selectorButtons")
        .attr("width","200")
        .attr("height",function(){return selectorButtonheight;})
        .style("fill",function(d,i){return "url(#gradient"+i+")";})
        .attr("x",-50)
        .attr("y",function(d,i){return 70+((selectorButtonheight+30)*i);})
        .on("click", function (d,i) {
          drawMap(i+1);
        });
      svg.selectAll(".selectorText")
        .data(buttonData)
        .enter()
        .append("text")
        .attr("class","selectorText")
        .attr("text-anchor","middle")
        .attr("font-size", "18px")
        .attr("x",50)
        .attr("y",function(d,i){return 95+((selectorButtonheight+30)*i);})
        .text(function(d){return d["name"]})
        .on("click", function (d,i) {
          drawMap(i+1);
        });
      svg.selectAll(".selectorTextFirst")
        .data(buttonData)
        .enter()
        .append("text")
        .attr("class","selectorTextFirst")
        .attr("font-size", "24px")
        .attr("x",-50)
        .attr("y",function(d,i){return 135+((selectorButtonheight+30)*i);})
        .text(function(d){return d["first"]})
        .on("click", function (d,i) {
          drawMap(i+1);
        });
      svg.selectAll(".selectorTextSecond")
        .data(buttonData)
        .enter()
        .append("text")
        .attr("class","selectorTextSecond")
        .attr("text-anchor","end")
        .attr("font-size", "24px")
        .attr("x",150)
        .attr("y",function(d,i){return 135+((selectorButtonheight+30)*i);})
        .text(function(d){return d["second"]})
        .on("click", function (d,i) {
          drawMap(i+1);
        });
        //check for circle clicks
        var drawMap = function(heatmap) {



          if (heatmap == 1) {
            svg.selectAll("path")
              .transition()
              .duration(750)
              .ease("linear")
              .style("fill", function(d){
                var value = d.properties.value1;
                if (value) {
                  logValue = value;
                  return color1(value);
                } else {
                  return "#ccc";
                }

              }); //fill
          } else if (heatmap == 2) {
            svg.selectAll("path")
              .transition()
              .duration(750)
              .ease("linear")
              .style("fill", function(d){
                var value = d.properties.value2;
                if (value) {
                  logValue = value;
                  return color2(value);
                } else {
                  return "#ccc";
                }

              }); //fill
          } else if (heatmap == 3) {
            svg.selectAll("path")
              .transition()
              .duration(750)
              .ease("linear")
              .style("fill", function(d){
                var value = d.properties.value3;
                if (value) {
                  logValue = value;
                  return color3(value);
                } else {
                  return "#ccc";
                }

              }); //fill
          }
        };
        // -- HIDY CODE END
        // -- BEN CODE BEGIN


        //city_list = [];

        //for ( i in data ){
        //  if ( data[i]['label'] == "city" ) {
        //    city_list.push({"name":data[i]["city"]});
        //  }
        //  //if (data[i]['city'] == "Ludlow") {
        //  //ob = data[i];
        //  //}
        //}

        xDom = ["m4m","m4w","w4m","w4w"];
        yvals = [ {"tag":"m4m","val":0},
              {"tag":"m4w","val":0},
              {"tag":"w4m","val":0},
              {"tag":"w4w","val":0} ];



        data.forEach(function(d) {
          d.frequency = +d.frequency;
        });
        var mmv = d3.max(yvals, function(d) { return parseInt(d.val,10); })
          x.domain(xDom);
        y.domain([0,180000]);

        svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate("+barXoffset+"," + (barYoffset+barHeight) + ")")
          .call(xAxis);

        svg.append("g")
          .attr("class", "yaxis")
          .attr("transform", "translate("+barXoffset+","+barYoffset+")")
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
          .attr("x", function(d) { return barXoffset+x(d.tag); })
          .attr("width", x.rangeBand())
          .attr("y", function(d) { return barYoffset+y(d.val); })
          .attr("height", function(d) { return barHeight - y(d.val); });
        svg.selectAll(".graphLabels")
          .data([""])
          .enter()
          .append("text")
          .attr("class","graphLabels")
          .attr("x",labelXoffset)
          .attr("y",labelYoffset)
          .attr("text-anchor","middle")
          .text(function(d){return d.toLowerCase();})
          .attr("font-size", "24px");
        svg.selectAll(".wordList")
          .data(["","","","",""])
          .enter()
          .append("text")
          .attr("class","wordList")
          .attr("x",wordListXoffset)
          .attr("y",function(d,i){return wordListYoffset+(i*30);})
          .attr("text-anchor","middle")
          .style("opacity","0")
          .text(function(d){return d.toLowerCase();});
        svg.selectAll(".countryButton")
          .data([""])
          .enter()
          .append("rect")
          .attr("class","countryButton")
          .attr("x", function(d,i) { return i*40; })
          .attr("width",40)
          .attr("y", height+90)
          .attr("height",10)
          .attr("fill", "blue")
          .style("opacity","0")
          .on("click", function(d,i) { return change("country","USA"); });
        svg.selectAll(".displayBar")
          .data(["city","state","country"])
          .enter()
          .append("text")
          .attr("class","displayBar")
          .attr("x",function(d,i){return labelXoffset-90+(i*90);})
          .attr("y",labelYoffset-30)
          .attr("text-anchor","middle")
          .attr("font-size", "18px")
          .text(function(d){return d;});

        change("country","USA",1500,1000);
        //change("country","USA",0,0);
        //svg.selectAll(".cityButton")
        //  .data(city_list)
        //  .enter().append("rect")
        //  .attr("class","cityButton")
        //  .attr("x", function(d,i) { return i*40 })
        //  .attr("width",40)
        //  .attr("y", height+90)
        //  .attr("height",10)
        //  .attr("fill", "blue")
        //  .on("click", function(d,i) { return change(d["name"]); });

        //d3.select("input").on("change", change);

        //var sortTimeout = setTimeout(function() {
        //d3.select("input").property("checked", true).each(change);
        //}, 1000);

        function change(type,name,b,a) {
          //alert(name);
          a = typeof a !== 'undefined' ? a : 1000;
          b = typeof b !== 'undefined' ? b : 0;
          var ob;

          if ( type == "state" ){
            for ( i in data ){
              if (data[i]["city"] == name) {
                ob = data[i];
              }
            }
          } else if ( type == "city" ) {
            for ( i in data2 ){
              if (data2[i][type] == name.city && data2[i]["state"] == name.state) {
                ob = data2[i];
              }
            }
          } else if (type == "country") {
            for ( i in data ){
              if (data[i]["city"] == name){
                ob = data[i];
              }
            }
          }

          termVals = [ {"word":ob["k1"],"val":ob["c1"]},
                       {"word":ob["k2"],"val":ob["c2"]},
                       {"word":ob["k3"],"val":ob["c3"]},
                       {"word":ob["k4"],"val":ob["c4"]},
                       {"word":ob["k5"],"val":ob["c5"]}]

          yvals = [ {"tag":"m4m","val":ob["m4m"]},
                {"tag":"m4w","val":ob["m4w"]},
                {"tag":"w4m","val":ob["w4m"]},
                {"tag":"w4w","val":ob["w4w"]} ];

          var mmv = d3.max(yvals, function(d) { return parseInt(d.val,10); })
            x.domain(xDom);
          y.domain([0,mmv]);


          // Copy-on-write since tweens are evaluated after a delay.
          var x0 = x.domain(data.sort(this.checked
                ? function(a, b) { return b.frequency - a.frequency; }
                : function(a, b) { return d3.ascending(a.letter, b.letter); })
              .map(function(d) { return d.letter; }))
            .copy();

          var transition = svg.transition().duration(a),
              delay = function(d, i) { return i * 50; };

          //transition.selectAll(".bar")
          //.delay(delay)
          //.attr("height", function(d) { return height - y(d.val); });
          var nameAr = [];
          if ( type == "state" ){
            nameAr.push(name.toLowerCase());
          } else if ( type == "city" ) {
            nameAr.push(name.city.toLowerCase()+", "+name.state.toLowerCase());
          } else if (type == "country") {
            nameAr.push("USA".toLowerCase());
          }

          svg.selectAll(".graphLabels")
            .transition()
            .duration(500)
            .delay(0)
            .style("opacity","0");

          svg.selectAll(".graphLabels")
            .data(nameAr)
            .transition()
            .duration(500)
            .delay(500)
            .style("opacity","1")
            .text(function(d) {return d;});

          svg.selectAll(".wordList")
            .transition()
            .duration(500)
            .delay(0)
            .style("opacity","0");

          svg.selectAll(".wordList")
            .data(termVals)
            .transition()
            .duration(500)
            .delay(500)
            .attr("font-size", function(d,i){return 24-(3*i)+"px"})
            .style("opacity","1")
            .text(function(d){return d.word+" ("+d.val+")";});


          svg.selectAll(".bar")
            .data(yvals)
            .transition()
            .delay(b)
            .duration(a)
            .attr("height", function(d) { return barHeight - y(d.val); })
            .attr("y", function(d) { return barYoffset+y(d.val)-1; })
            svg.select(".yaxis").transition().duration(1000).call(yAxis);

        }

      }); //end of city.csv

    }); //end of json = state path


  }); //end of state.csv


