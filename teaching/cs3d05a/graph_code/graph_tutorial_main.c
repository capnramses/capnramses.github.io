// anton gerdelan
// 30 nov 2016
// graph structure idea
// this is the file from live coding demo in class. there may be bugs in here!
// you can use this as a starter if you like - perhaps you can simplify it

#include <assert.h>
#include <stdbool.h>
#include <stdio.h>
#include <string.h>

#define MAX_NODE_CONNECTIONS 16
#define MAX_NODES 64

// my graph vertices are going to be stored in
// a boring array as structs because dynamic
// memory is a pain and i'm scared of pointers
typedef struct Graph_Node {
	char data; // 'A', 'B' etc
	// this is my adjacency list - i'm going to
	// store this per-node. this is a bit redundant
	// but hey i could now do a directed graph.
	// each 'edge' is just the index of another node in
	// the array of vertices
	int number_of_edges;
	int edges[MAX_NODE_CONNECTIONS];
	// weights of each edge
	int weights[MAX_NODE_CONNECTIONS];

	// variables for working out dijkstra
	bool is_permanent;
	int parent_index;
	int shortest_length;	
} Graph_Node;

typedef struct Graph {
	// adjacency lists are stored inside nodes
	// in my graph. this is one of many many possible design ideas
	Graph_Node vertices[MAX_NODES];
	int number_of_vertices;
} Graph;

// ill add edges in a later function to let me
// simplify this one
int add_vertex_to_graph(Graph* graph, char data){
	assert(graph != NULL);
	assert(graph->number_of_vertices < MAX_NODES);

	int index = graph->number_of_vertices;
	graph->vertices[index].data = data;
	graph->vertices[index].number_of_edges = 0;
	graph->vertices[index].is_permanent = false;
	graph->vertices[index].parent_index = -1;
	graph->vertices[index].shortest_length = 9999999;
	
	graph->number_of_vertices++;
	return index;
}

// add an edge in both directions - to-from and also from-to
void add_edge_undirected(Graph* graph, int start_vertex_index,
	int end_vertex_index, int weight) {
	assert(graph != NULL);
	assert(start_vertex_index > -1 &&
		start_vertex_index < graph->number_of_vertices);
	assert(end_vertex_index > -1 &&
		end_vertex_index < graph->number_of_vertices);

	{ // go to start vertex - add an edge to it if there is space left
		// and also put the weight in
		int first_vert_edge_count = graph->vertices[start_vertex_index].number_of_edges;
		assert(first_vert_edge_count < MAX_NODE_CONNECTIONS);

		graph->vertices[start_vertex_index].edges[first_vert_edge_count] =
		 	end_vertex_index;
		graph->vertices[start_vertex_index].weights[first_vert_edge_count] = weight;
		graph->vertices[start_vertex_index].number_of_edges++;
	}
	{ // repeat the for the second vertex
		int second_vert_edge_count = graph->vertices[start_vertex_index].number_of_edges;
		assert(second_vert_edge_count < MAX_NODE_CONNECTIONS);

		graph->vertices[end_vertex_index].edges[second_vert_edge_count] =
		 	start_vertex_index;
		graph->vertices[end_vertex_index].weights[second_vert_edge_count] = weight;
		graph->vertices[end_vertex_index].number_of_edges++;
	}
}


int main() {
	Graph my_graph;
	my_graph.number_of_vertices = 0;

	int letter_indices[100000];
	memset(&letter_indices, -1, sizeof(int) * 36);

	for (int i = 'A'; i <= 'L'; i++) {
		letter_indices[i] = add_vertex_to_graph(&my_graph, (char)i);
	}
	add_edge_undirected(&my_graph, letter_indices['A'], letter_indices['B'], 1);
	add_edge_undirected(&my_graph, letter_indices['B'], letter_indices['C'], 2);
	add_edge_undirected(&my_graph, letter_indices['B'], letter_indices['D'], 2);
	// and so on

	// i'd do depth-first search here, and check printout too see if i made any
	// mistakes in the above implementation (i probably did!)

	return 0;
}
