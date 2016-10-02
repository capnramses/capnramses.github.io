//var global_graph;

var node_radius = 4;

var svg_border = 2;
var control_panel_height = 250;
//var t_div;
//limits of positions of nodes in the graph


////var view_transform = { x_transorm;

function graphViewer(nodes,links){
	
var width = 1600,
    height = 900 ;

var color = d3.scale.category20();

// calulate the edge cities as node=s
vis = this;
var force = d3.layout.force()
    .charge(-30)
    .linkDistance(20)
    .size([width, height]);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

  force.nodes(nodes)
      .links(links)
      .start();

  var link = svg.selectAll(".link")
      .data(links)
    .enter().append("line")
      .attr("class", "link")
      .style("stroke-width", function(d) {
    	  return d.weight;
    	  });

  var node = svg.selectAll(".node")
      .data(nodes)
    .enter().append("circle")
      .attr("class", "node")
      .attr("r", 3)
      .style("fill", function(d) { 
    	  if(d.status == "alive") {
    		  return color(d.colorIndex);
    	  }else if(d.status == "immune") {
    		  return "pink";
    	  }
    	  return "black"    	  
      })
      .call(force.drag);

  node.append("title")
      .text(function(d) { return d.id + "_"+d.status; });

  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });

	});

	vis.upateColors =  function() {

		svg.selectAll(".node")
			.data(nodes)
            .style("fill", function(d) { 
			  	  if(d.status == "alive") {
			  		  return color(d.colorIndex);
			  	  } else if(d.status == "immune") {
		    		  return "pink";
		    	  }
			  	  return "black";    	  
            })
	}
	
  return vis;
}

console.log("Starting graph viewer executions");

var g =  new game_graph();
g.addCity("Dublin",10,2,0.5);
g.addCity("London",100,4,0.1);
g.addCity("New York", 150, 2, 0.1);
g.addCity("Paris", 200, 4, 0.4);
g.addCity("Delhi", 300, 8, 1.0);
g.addCity("Sydney", 50, 3, 0.4);
g.addCity("Moscow", 120, 4, 0.13);
g.addCity("Tokyo", 160, 10, 0.05);

g.connectCities("London", "Paris", 10);
g.connectCities("Dublin", "London", 1);
g.connectCities("London", "New York", 5);
g.connectCities("Moscow", "Delhi", 1);
g.connectCities("Tokyo", "Delhi", 4);
g.connectCities("Tokyo", "Moscow", 8);
g.connectCities("Sydney", "Delhi",2);
g.connectCities("Sydney", "New York",2);


g.deployComedian("Dylan Moran","Dublin", 1.0, "stand-up");
g.deployComedian("Tim Minchin","Sydney", 1.0, "stand-up");
g.deployHeckler("Dad1", "Sydney")
 var nodes = g.nodes();
var edges = g.edges();
var v = new graphViewer(nodes,edges);

function executeTick () {
	g.nextTurn();
	vis.upateColors();
	}

d3.select("#tickButton").on("click", function() {
	console.log("Button Clicked");
	executeTick();
	}
) ;



