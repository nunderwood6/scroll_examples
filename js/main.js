// Add all scripts to the JS folder
function wrapper(){


//store width in pixels
var h = $("figure.map").height();
var w = $("figure.map").width();

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

//////////////////////////////////////////////////////////////////////
//////////////////1)Smooth Transitions////////////////////////////////
//////////////////////////////////////////////////////////////////////
var steps = d3.range(0,100,1).map(x=>x*0.01);

var observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0
}

let observer = new IntersectionObserver(callback, observerOptions);

var target = d3.select(".step").node();
observer.observe(target);

function callback(entries, observer){
  if(entries[0].intersectionRatio>0){
    console.log("Attach scroll listener!");
    window.addEventListener("scroll",scrollHandler);
  } else {
    console.log("Remove scroll listener!");
    window.removeEventListener("scroll", scrollHandler);
  }
}

var image = d3.select("img.fadeIn");

function scrollHandler(){
  //console.log(target.getBoundingClientRect());
  var topTarget = target.getBoundingClientRect().top;
  var topMap = image.node().getBoundingClientRect().top;
  var mapHeight = image.node().getBoundingClientRect().height;
  //var percentScrolled = ;
  console.log("target:"+topTarget);
  console.log("map:"+topMap);
  console.log("mapheight:"+mapHeight);

  var percent = 1 - ((topTarget - topMap) /mapHeight);
  console.log("percent:"+percent);
  image.style("opacity", percent);
  //var opacity = percentScrolled;
  //console.log(percentScrolled);
  //image.style("opacity", percentScrolled);
}



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

  var svg = d3.select("figure.map")
              .append("svg")
              //.attr("overflow", "visible")
              // .attr("width", w+"px")
              // .attr("height", h+"px")
              .attr("viewBox", `0 0 ${w} ${h}`)
              .style("position","absolute")
              .style("left", "0")
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
  							.attr("fill", "#fff")
  							.attr("stroke", "none")
  							.attr("transform", `translate(${w-axisMargins.right-6},${yScale(500)-6})`);

   Promise.all([
      d3.json("data/bounding_box_wgs84.geojson"),
      d3.json("data/states.json")
    ])
    .then(function([boxJSON,states_topoJSON]){

    	var box = boxJSON.features;
    	var states = topojson.feature(states_topoJSON, states_topoJSON.objects.states).features;

     	albers.fitExtent([[0,0],[w,h]], boxJSON);

     	var states = svg.append("g")
     					.selectAll(".states")
     					.data(states)
     					.enter()
     					.append("path")
     						.attr("d", path)
     						.attr("class", "states")
     						.attr("fill", "none")
     						.attr("stroke", "#fff")
     						.attr("stroke-width", 0.1)
     						.attr("opacity", 0.7);

     	// var box = svg.append("g")
     	// 				.selectAll(".box")
     	// 				.data(box)
     	// 				.enter()
     	// 				.append("path")
     	// 					.attr("d", path)
     	// 					.attr("class", "states")
     	// 					.attr("fill", "none")
     	// 					.attr("stroke", "#fff")
     	// 					.attr("stroke-width", 0.25);


     });

























}
window.onload = wrapper();