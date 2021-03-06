// Add all scripts to the JS folder
function wrapper(){


////////////////////////
//Set image width and height as percentages
//window width and height
var screenRatio = window.innerWidth/window.innerHeight;

var image = d3.select("img.stack").node();
var imageRatio = image.naturalWidth/image.naturalHeight;

if(imageRatio>screenRatio){
  d3.selectAll("img.stack").style("width", "100%");
} else {
  var width = window.innerHeight * 1.5 * 0.9 / window.innerWidth * 100
  d3.selectAll("div.stack").style("width", width + "%")
                           .style("height", width*3/2 +"%")
                           .style("margin-left", (100-width)/2 + "%")
                           .style("padding-top", 2+"px");
}



//////////////////////////////////////////
var totalExecutions = 0;
//store width in pixels
var h = $("div.stack").height();
var w = $("div.stack").width();
var currentDepth = 500;

console.log(h);
console.log(w);

//////////////////////////////////////////////////////////////////////
//////////////////1)Discrete Steps////////////////////////////////////
//////////////////////////////////////////////////////////////////////
  // function updateChartForward(index){
  //   //fade new image in
  //   var newImage =d3.select(`img[data-index="${index+1}"]`);
  //   newImage.transition().duration(1000).style("opacity", 1);
  //   //fade old image out
  //   var oldImage = d3.select(`img[data-index="${index}"]`);
  //   oldImage.transition().duration(1000).style("opacity", 0);

  // }

  // function updateChartBackward(index){
  //   console.log(index);
  //   // //fade new image in
  //   var newImage =d3.select(`img[data-index="${index}"]`);
  //   newImage.transition().duration(1000).style("opacity", 1);
  //   //fade old image out
  //   var oldImage = d3.select(`img[data-index="${index+1}"]`);
  //   oldImage.transition().duration(1000).style("opacity", 0);
  // }


  //set top of sticky position so it's centered vertically
  var stickyH = $(".sticky").height();
  var windowH = window.innerHeight;
  var stickyTop = (windowH - stickyH)/2;
  d3.select("figure.sticky").style("top",stickyTop+"px");

  // var stepSel = d3.selectAll(".step");

  // enterView({
  //   selector: stepSel.nodes(),
  //   offset: 0.5,
  //   enter: el=> {
  //     const index = +d3.select(el).attr('data-index');
  //     updateChartForward(index);
  //   },
  //   exit: el => {
  //     let index = +d3.select(el).attr('data-index');
  //     // index = Math.max(0, index - 1);
  //     updateChartBackward(index);
  //   }
  // });






// function scrollHandler(){

//   if(!ticking){

//   }

  
//   // var percent = (window.innerHeight - topTarget)/ window.innerHeight;
//   // console.log(topTarget);
//   // console.log(window.innerHeight);
//   // console.log("percent:"+percent);
//   // image.style("opacity", percent);
//   // totalExecutions++;
//   // console.log("total Executions: "+totalExecutions);

// }

//////////////////////////////////////////////////////////////////////
//////////////////Build Map///////////////////////////////
//////////////////////////////////////////////////////////////////////

  // //check screen aspect ratio, set margins
  // var aspectRatio = w/h;
  // var focusArea;

  // console.log(w,h,aspectRatio);

  // if(aspectRatio>1.5){
  // 		console.log("wide!");
  //     focusArea = {
  //       width: h*1.5,
  //       height: h
  //     }
  // } else {
  //     focusArea = {
  //       width: w,
  //       height: h
  //     }
  // }

  // // var margins = {
  // //   top: (h - focusArea.height)/2,
  // //   left: (w - focusArea.width)/2
  // // }

  // console.log(focusArea,margins);
var stateCentroids;

  var svg = d3.select("figure.map")
              .append("svg")
              //.attr("overflow", "visible")
              // .attr("width", w+"px")
              // .attr("height", h+"px")
              .attr("viewBox", `0 0 ${w} ${h}`)
              .attr("width", width + "%")
              .style("position","absolute")
              .style("left", (100-width)/2 + "%")
              .style("top", "0");

  //create projection
  const albers = d3.geoConicEqualArea()
	                  .parallels([29.5, 45.5])
	                  .rotate([96, 0]) //center longitude
	                  .center([0,38.7]); //center latitude

  //path generator
  const path = d3.geoPath()
                 .projection(albers);

  var axisMarginTop = 100;
  var axisMargins = {
  	top: 100,
  	right: 60,
  	bottom: 50
  }

  var mobile = w < 600;

  if(mobile){
  	axisMargins = {
	  top: 20,
	  right: 40,
	  bottom: 20
  	}
  }

  //create y scale to show depth
  var yScale = d3.scaleLinear()
  				  .domain([0,3000])
  				  .range([axisMargins.top,h - axisMargins.bottom]);

  var yAxis = d3.axisRight(yScale)
  					.ticks(5)
  					.tickFormat(d3.format("d"));

  var yAxis = svg.append("g")
  					.attr("class", "yAxis")
  					.attr("transform", `translate(${w-axisMargins.right},0)`)
  					.call(yAxis);

  var depthMarker = svg.append("path")
  							.attr("d", "M 0 0 L 9 6 L 0 12 z")
                .attr("class", "depthMarker")
  							.attr("fill", "#fff")
  							.attr("stroke", "none")
  							.attr("transform", `translate(${w-axisMargins.right-6},${yScale(currentDepth)-6})`);

  var depthText = d3.select("figure.map").append("p")
                              .style("position", "absolute")
                              .style("right", axisMargins.right + "px")
                              .style("top", "10px")
                              .html(`Depth: <span class="depth">500</span>m`);

                              console.log("here!");

   Promise.all([
      d3.json("data/bounding_box_wgs84.geojson"),
      d3.json("data/states.json")
    ])
    .then(function([boxJSON,states_topoJSON]){

    	var box = boxJSON.features;
    	var statesData = topojson.feature(states_topoJSON, states_topoJSON.objects.states).features;

     	albers.fitExtent([[0,0],[w,h]], boxJSON);

     	var states = svg.append("g")
     					.selectAll(".states")
     					.data(statesData)
     					.enter()
     					.append("path")
     						.attr("d", path)
     						.attr("class", "states")
     						.attr("fill", "none")
     						.attr("stroke", "#fff")
     						.attr("stroke-width", 0.1)
     						.attr("opacity", 0.7);



       stateCentroids = svg.append("g")
              .attr("class","centroids")
              .selectAll("circle")
              .data(statesData)
              .enter()
              .append("circle")
                .attr("x2", function(d){
                    return path.centroid(d)[0];
                })
                .attr("y2", function(d){
                    return path.centroid(d)[1];
                })
                //.attr("transform", function(d)  {return "translate(" + path.centroid(d) + ")"; })
                .attr("class", "stateCentroids")
                .attr("r", 2)
                .attr("fill", "#fff");

     	var coords = [];

      box.forEach(function(point){
            coords.push(path.centroid(point));
      });
      
      var bounds = {
            top: coords[3][1],
            left: coords[3][0],
            bottom: coords[0][1],
            right: coords[1][0]
      }

        d3.selectAll(".raster img")
            .style("width", bounds.right - bounds.left + "px")
            .style("height", bounds.bottom - bounds.top + "px")
            .style("left", bounds.left + "px")
            .style("top", bounds.top + "px");

      var extentRect = svg.append("rect")
                            .attr("x", bounds.left)
                            .attr("y", bounds.top)
                            .attr("width", bounds.right - bounds.left)
                            .attr("height", bounds.bottom - bounds.top)
                            .attr("fill", "none")
                            .attr("stroke", "#fff");


     });



//////////////////////////////////////////////////////////////////////
//////////////////1)Smooth Animations, with RAF///////////////////////////////
//////////////////////////////////////////////////////////////////////


//observer for 1000
var observerOptions = {
  root: null,
  rootMargin: "0px",
  threshold: 0
}

let observer = new IntersectionObserver(intersectionCallback, observerOptions);

var target = d3.select(".step").node();
observer.observe(target);

var latestKnownTop = window.innerHeight;
var ticking = false;

function onScroll(){
  latestKnownTop = target.getBoundingClientRect().top;
  requestTick();
}

function requestTick(){
  if(!ticking){
      requestAnimationFrame(update);
  }
  ticking = true;
}

function update(){
  //reset tick to capture next scroll
  ticking = false;
  var currentTop = latestKnownTop;

  var percent = (window.innerHeight - currentTop)/ window.innerHeight;
  if(percent>1) percent = 1;
  if(percent<0) percent = 0;
  currentDepth = 500 + 2500*percent;


  d3.selectAll("img.stack").style("opacity", function(d){
    var depth = d3.select(this).attr("data-index");
    var currentPercent = 1 - (depth - currentDepth) /500;
    if(currentPercent < 0){
      return 0;
    } else if(currentPercent > 1) {
      return 1;
    } else {
      return currentPercent;
    }
  });

  d3.select(".depthMarker").attr("transform", `translate(${w-axisMargins.right-6},${yScale(currentDepth)-6})`);
  d3.select(".depth").html(Math.round(currentDepth))

  // //fly from origin to centroids
  // stateCentroids.attr("cx", function(d){
  //     var x2 = d3.select(this).attr("x2");
  //     var x = x2*percent;
  //     return x;
  // }).attr("cy", function(d){
  //     var y2 = d3.select(this).attr("y2");
  //     var y = y2*percent;
  //     return y;
  // });


}

function intersectionCallback(entries, observer){
  if(entries[0].intersectionRatio>0){
    window.addEventListener("scroll",onScroll);
  } else {
    window.removeEventListener("scroll", onScroll);
  }
}



}
window.onload = wrapper();