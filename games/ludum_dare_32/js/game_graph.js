

function game_graph(){

	var graph = this;
	var nodes=[];
	var edges= [];
	var edgeMap = {}; // store a key based on end node ids to see if edge alread exists. ends are always in alphabetical orer
	var cities = {};
	var comedians = [];
	var comediansMap = {};// used to quickly access comedian by name
	var hecklers = [];
	
	
// global vlaues of the class
	var JOKE_THRESHOLD = 0.9 // joke must score mopre than this to land  
	var INTER_CITY_COEFFICIENT = 0.915;//  the hitthe joke will take when trying to onfect somebody in another city 
	
	function getEdgeMapKey (node1, node2) {
		var edgeMapKey = node1.id + "_" + node2.id;
		if(node1.id > node2.id ) {
			 edgeMapKey = node2.id + "_" + node1.id;	
		}	
		return edgeMapKey;
	}
	
	function edgeExists(node1,node2) {
		var key = getEdgeMapKey(node1, node2)
		if(edgeMap.hasOwnProperty(key)) {
			return true;
		}
		return false;
	}
	
	function removeDuplicateNodes(inArray) {
		if(inArray.length < 2) {
			return inArray;
		}
		
		inArray.sort(function (a, b) {
			  if (a.id > b.id) {
			    return 1;
			  }
			  if (a.id < b.id) {
			    return -1;
			  }
			  // a must be equal to b
			  return 0;
			});
		
			var outArray = [];
			
			for(var i = 0 ; i < inArray.length -1; i++ ) {
				if (inArray[i].id !== inArray[i+1].id ) {
					// copy the elemet
				outArray.push(inArray[i]);
				}				
			};
			outArray.push(inArray[inArray.length - 1]);
			
			return outArray;
		
		}
	

	graph.addCity = function (name,size,edgeRatio, rewireCoefficient, humourLevel) {
		// name  = cirty name, used as kez in cities map
		// size = number of nodes in the city
		// connectivity = the number of edges each node should connect to
		// rewireCoefficient =  percentage chance of an edge being rewired (0.1 ~= small; world graph, 1.0 = fully random grpah)
		// once grpah is wired  average node degree  will be edge_ratio * 2
		
		if(!rewireCoefficient) {
			rewireCoefficient = 0.1;
		}else if (rewireCoefficient < 0.0) {
			rewireCoefficient = 0.0;
		}else if (rewireCoefficient > 1.0) {
			rewireCoefficient > 1.0;
		}	
		
		if(edgeRatio < 2) {
			console.log("ERROR dangerously low edge ratio");
			return null;
		}
		
		var cityIndex = 0;
		for( var item in cities) {
			cityIndex++;
		}
		
		
		cities[name] =  {nodes:[],
						 edges:[],
		                 stats:{population:size,
								victims:0,
								immune: 0,
								originalPopulation:size,
								humourLevel: humourLevel||1.0,
								connectivity: edgeRatio,
								randomness: rewireCoefficient} // set humour level to 1 if none supplied
		};
		
		for( var i = 0; i <  size; i++) {
			var node = {id: name + "_n_"  +i , status:"alive" , index:i, neighbours: [], colorIndex:cityIndex, city:name};
			nodes.push(node),
			cities[name].nodes.push(node);
		}
		// edges are assigned at random
		// we want no disconnected compnents
		// assign 2 edges to each node  wiuth the other end being random
		// only a small chance of a disonnect
		var fully_connected =  false;
		// assign each node to the next two nodes in the node array, forming a lattics
		cities[name].nodes.forEach(function(n, index){
			for(var i = 0 ; i < edgeRatio; i= i+1) {
				var newEdge = {source: n, target:  cities[name].nodes[(index + i + 1) % size], type: "local", weight: 1.0,coefficient:1.0};
				edges.push(newEdge);
				cities[name].edges.push(newEdge);
					// add to global grpah map
				var edgeMapKey = getEdgeMapKey(newEdge.source,newEdge.target);							
				edgeMap[edgeMapKey]=newEdge;
			}
		});
		// then randmly rewire the target withg 10% chance to form a small world grpah
		cities[name].edges.forEach(function(e, index){
			//		get a radom number between 0 and 1 if the number is less 
			//		then the wiring coefficent rewire itherwise don''t
				
				// Only rewire within the same cluster
				var randomNum = Math.random();
				if (randomNum < rewireCoefficient) {
					// reset the target of the edge at random					
					// choose  another endnode arandom 
					// but not the source as we will have no edge loops
								
					var newTarget = e.source;
					
					while(newTarget == e.source) {
						// randomly select ne target from unconnect nodes
						newTarget = cities[name].nodes[Math.floor(Math.random() * cities[name].nodes.length )];
						if( edgeExists(e.source, newTarget) ){
						// try again (so reset the target to the source
							newTarget = e.source;
						}
						
					}
					//remove old value from edge map
					 var oldEdgeMapKey = getEdgeMapKey(e.source, e.target);
					 delete edgeMap[oldEdgeMapKey]
					 //rewire edge and update edge map
					e.target = newTarget;
					 var newEdgeMapKey = getEdgeMapKey(e.source, e.target);
					 edgeMap[newEdgeMapKey]=e;
				}
			
		});
		
		// nodes rewired..... now lets build the dajacency list for each node
		// to speed up future operations
		cities[name].edges.forEach(function(e, index) {
			e.source.neighbours.push(e.target);
			e.target.neighbours.push(e.source);			
		});
		return graph;
	};
	
	
	graph.connectCities = function(city1,city2,numberOfConnections){
		// connect two cities via random nodes...
		if(!cities.hasOwnProperty(city1) || !cities.hasOwnProperty(city2) ) {
			console.log("Whoops invalid city name provided.... input names were " + city1 + " , " + city2);
		}
		for(var i = 0; i <numberOfConnections;i++) {
			var newSource = cities[city1].nodes[Math.floor(Math.random() * cities[city1].nodes.length )];
			var newTarget = cities[city2].nodes[Math.floor(Math.random() * cities[city2].nodes.length )];
			var newEdge = {source: newSource, target: newTarget, type: "intercity", weight : 3, coefficient:0.9};
			edges.push(newEdge);
			newEdge.source.neighbours.push(newEdge.target);
			newEdge.target.neighbours.push(newEdge.source);	
		}			
		return graph;
	};
	graph.nodes = function () {
		return nodes;
	};
	graph.edges = function(){
		return edges;
	};
	
	graph.deployComedian = function(name,cityName, talent, type) {
		var comedian = {};
		comedian.type = type || "standup";
		comedian.name = name || "generic funny person";
		 
		comedian.talent = talent > 1 ?  1.0 : talent <= 0.01 ? 0.01 :  talent; // bind talent in range 0.01 -> 1.0
		comedian.kills = 0;
		if(!cities.hasOwnProperty(cityName)) {
			console.log( "Error invlaid city for comedian!");
		}		
		var alivePopulation = [];
		cities[cityName].nodes.forEach(function(n){
			if(n.status == "alive") {
				alivePopulation.push(n);
			}			
		});
		if(alivePopulation.length < 1) {
			console.log("Unable to deploy comedian as city has no audience");
			return null;
		}
		
		// set the comedian new city and deploy him to a node at random in that city
		comedian.node = alivePopulation[Math.floor(Math.random() * alivePopulation.length)] ;	
		comedian.node.status = "dead";
		cities[cityName].stats.population--;
		cities[cityName].stats.victims++;
		
		// the audience is the ist of all poitential victioms.... i .e. neighbours of beople who have already beenkilled by the comedian
		comedian.audience = comedian.node.neighbours;
		comedian.city = cityName;
		
		comedians.push(comedian);
		comediansMap[name] = comedian;
		
		comedian.tellJoke = function() {
			// tellin a joke has a success rate based on the comedian quality, the humour of a city
			// each neighbour of the comedian
			
			
			var hits =0;
			var misses = 0;
			var newNeighbours =0;
			var me = this;
		    var newAudience = [];
			if(me.audience.length <1 ){
				console.log("Comedian "  + this.name +" has no audience");
				return;
				}
			console.log("Comedian "  + this.name +" is telling a  joke");
			me.audience.forEach(function(n) {	
				// first make sure that the perosn has not been killed by another comedians joke
				// or is not immune
				if ( n.status ==  "alive") {
					// check if joke lands
					// a score of JOKE_THRESHOLD or higher means ther joke landed
					// check if joke does lands
					var baseScore = Math.random();
					var targetCityHumour = cities[me.city].stats.humourLevel;
					var interCityModifier = 1.0;
					if(me.node.city !=  n.city) {
						interCityModifier = INTER_CITY_COEFFICIENT;
					}
					
					var nodeCityName = n.city;
					var totalScore = baseScore * me.talent * targetCityHumour * interCityModifier;
					if(totalScore >= JOKE_THRESHOLD ) {
						// we have a hit 
						n.status = "dead";
						hits++;
						comedian.kills++;
						cities[nodeCityName].stats.victims++;
						
						if(cities[nodeCityName].stats.population <= 0) {
							console.log("Warnign 0 nodes left")
						}
						
						cities[nodeCityName].stats.population--;
						// person is dead
						// expanmf the audience to include their neighbours
						n.neighbours.forEach(function(neighbour) {
							if(neighbour.status == "alive") {
								newAudience.push(neighbour);
							}							
						});
						
											} else {
						// joke does not land so the person is still alive
						newAudience.push(n);		
						misses++;
					}
				}			
			}); //end this.audience.forEach
			// new Audience may have duplicate  so need to clean it up
			var oldAudienceSize = me.audience.length;
			me.audience = removeDuplicateNodes(newAudience)
			newNeighbours = me.audience.length - (hits + misses);
			console.log("Hits:" + hits + "   Misses:" + misses + "    audience members:" +  me.audience.length  );
			
		}; // end telljoke
		return comedian;		
	};	
	
	graph.nextTurn = function() {
		hecklers.forEach(function(h) {
			h.move();
		});	
		comedians.forEach (function(c) {
			c.tellJoke();
		});	
	};
	
	graph.getCityStats = function(cityName) {
		if(!cities.hasOwnProperty(cityName)) {
			console.log("Error in getCityStats: city not found");
			return null;	
		}
			return   cities[cityName].stats;
	}
		
	graph.moveComedian= function(comedianName, newCity) {
		// returns the update comedian value  or null if comedian is not found
		// find the commedian	
		if(!comdedians.hasOwnProperty("comedianName")) {
			console.log("Error in moveCOmedian: comedian not found");
			return null ;			
		};
		var c = comediansMap[c];
		if(!cities.hasOwnProperty(cityName)) {
			console.log("Error in moveComedian: city not found");
			return c;	
		}
		var city = cities[newCity];
		if(city.stats.population < 3) {
			console.log("Error in moveComedian: Target city does not have enough population");
			return c;
		}
				//need to find all living ndoes in the city
		var alivePopulation = [];
		city.nodes.forEach(function(n) {
			if(n.status == "alive") {
				alivePopulation.push(n);
			}			
		});
		// set the comedian new city and deploy him to a node at random in that city
		comedian.node = alivePopulation[Math.floor(Math.random() * alivePopulation.length)] ;	
		c.city = newCity;
		return c;
	}
		
	graph.deployHeckler = function(name,cityName) {
		// heckler simply does a roandom walk in a city.... marking people as immune
		var heckler = {};
		heckler.name = name;
		heckler.city = cityName;
		var alivePopulation = [];
		cities[cityName].nodes.forEach(function(n){
			if(n.status == "alive") {
				alivePopulation.push(n);
			}			
		});
		// set the comedian new city and deploy him to a node at random in that city
		if(alivePopulation.length < 1) {
			console.log("Unable to deploy heckler as city has no audience");
			return null;
		}
		heckler.node = alivePopulation[Math.floor(Math.random() * alivePopulation.length)] ;	
		heckler.node.status = "immune";
		heckler.move = function() {
			var neighbours = heckler.node.neighbours;
			var aliveNeighbours = [];
			var immuneNeighbours = []; // keep track of immune neighbours in case there are no alive ones
			neighbours.forEach(function(n) {
				if(n.city == heckler.city){
					if (n.status == "alive") {
						aliveNeighbours.push(n);
					}else if (n.status == "immune") {
						immuneNeighbours.push(n);
					}	
				}
			});
			
			if(aliveNeighbours.length > 0){
				heckler.node = aliveNeighbours[Math.floor(Math.random() * aliveNeighbours.length)] ;	
			}else if (immuneNeighbours.length > 0) {
				heckler.node = immuneNeighbours[Math.floor(Math.random() * immuneNeighbours.length)] ;	
			}else {
				console.log("Warning: hecklerhas no neioghbours and is stuck")
			}
			heckler.node.status = "immune";
			console.log("Heckler " + heckler.name + " is at node " + heckler.node.id)
		}		
			hecklers.push(heckler);
		return heckler;
	}	
	graph.getCityNodes = function(cityName) {
		
	if(!cities.hasOwnProperty(cityName)) {
			console.log("Error in getCityNodes: city not found");
			return null;	
		}
		return cities[cityName].nodes;
	};
	graph.getCityEdges = function(cityName) {
		if(!cities.hasOwnProperty(cityName)) {
			console.log("Error in movgetCityEdgeseComedian: city not found");
			return null;	
		}
			return cities[cityName].edges;
	}
	
	return graph;	

}





