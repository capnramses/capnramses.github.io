//
// A-Star Demo for class
// Anton Gerdelan - 1 Dec 2016
// compile: clang -std=c99 -Wall -g -o demo main.c
// plan:
// * make a 2d grid for the graph domain
// * use manhattan distance for the heuristic
// * use the image loader we wrote to write numbered images out at fatter size than
// 1px
// show grey gradient to indicate cost
// * start cell green
// * end cell red
// * path blue
// * random obstacles in black (C-shaped walls)

#include <stdio.h>
#include <assert.h>
#include <stdbool.h>
#include <stdlib.h> // abs

#define NO_PARENT -1
#define WORLD_SIZE 16
#define ADJACENT_MOVE_COST 1
#define MAX_FRONTIER ( WORLD_SIZE * WORLD_SIZE )

// uncomment this to spit out images (WARNING 28MB * 173 images)
#define OUTPUT_IMAGES

// a 2d coordinate
typedef struct Coord { int x, y; } Coord;

// a vertex in the graph
typedef struct Node {
	// the previous node in the path to here
	Coord parent;
	// accumulated cost of the path to here - may be updated
	int cost;
	bool was_visited;
	bool is_obstacle;
} Node;

Node graph[WORLD_SIZE][WORLD_SIZE];

// returns Manhattan distance from any square to the goal
int heuristic( Coord current, Coord goal ) {
	assert( current.x >= 0 && current.x < WORLD_SIZE );
	assert( current.y >= 0 && current.y < WORLD_SIZE );

	int x_dist = abs( goal.x - current.x );
	int y_dist = abs( goal.y - current.y );
	int h = x_dist + y_dist;
	return h;
}

void reset_graph() {
	for ( int row = 0; row < WORLD_SIZE; row++ ) {
		for ( int col = 0; col < WORLD_SIZE; col++ ) {
			graph[row][col].parent = ( Coord ){.x = NO_PARENT, .y = NO_PARENT };
			graph[row][col].cost = 0;
			graph[row][col].was_visited = false;
		}
	}
}

void write_ppm( Coord goal, Coord* frontier, int frontier_len ) {
	int img_scale = 50;
	char fname[256];
	static int seq = 0;
	sprintf( fname, "out%05i.ppm", seq );
	seq++;
	FILE *fp = fopen( fname, "w" );
	fprintf( fp, "P3\n%i %i\n255\n", WORLD_SIZE * img_scale, WORLD_SIZE * img_scale );

	for ( int row = 0; row < WORLD_SIZE * img_scale; row++ ) {
		for ( int col = 0; col < WORLD_SIZE * img_scale; col++ ) {
			int col_idx = col / img_scale;
			int row_idx = row / img_scale;

			int r = 255, g = 255, b = 255;

      if (graph[row_idx][col_idx].was_visited) {
        r = g = b = 200;
      }

      for (int i = 0; i < frontier_len; i++) {
        Coord fc = frontier[i];
        if (fc.x == col_idx && fc.y == row_idx) {
          r = (int)((float)255.0f / ((float)i + 1.0f));
          g = b = 0;
          break;
        }
      }

			Coord parent = graph[goal.y][goal.x].parent;
			while ( parent.x != NO_PARENT && parent.y != NO_PARENT ) {
				if ( parent.x == col_idx && parent.y == row_idx ) {
					r = 0;
					b = 255;
					g = 0;
					break;
				}
				parent = graph[parent.y][parent.x].parent;
			}
			if ( graph[row_idx][col_idx].is_obstacle ) {
				r = g = b = 100;
			}
			if ( row_idx == 0 && col_idx == 0 ) {
				r = b = 0;
				g = 255;
			}
			if ( ( row_idx == WORLD_SIZE - 1 ) && ( col_idx == WORLD_SIZE - 1 ) ) {
				b = g = 0;
			}

			fprintf( fp, "%i %i %i ", r, g, b );
		}
		fprintf( fp, "\n" );
	}
	fclose( fp );
}

void astar( Coord start, Coord goal ) {
	//
	// this is the main working data structure(s) -- priority queue for Open List
	//
	Coord frontier[MAX_FRONTIER];
	int frontier_score[MAX_FRONTIER];
	frontier[0] = start;
	frontier_score[0] = 0;
	int frontier_len = 1;
	//
	// my Closed List isn't another queue - i just flag visited nodes
	// they can still be updated if a new path to them is shorter
	// greedy best-first doesn't usually bother with that
	//
	graph[start.y][start.x].was_visited = true;

	int probe_count = 0;

	//
	// same core algorithm as Dijkstra - add first node to queue loop until queue is
	// empty
	while ( frontier_len > 0 ) {
		// get smallest item in frontier
		Coord current = frontier[0];

		// should probably allow this to be updated by one more queue item
		// in the case that our heuristic is slightly misleading - or tweak h(n)
		if ( current.x == goal.x && current.y == goal.y ) {
			printf( "path found -- HALT\n" );
			break;
		}

		// this is because i just used an array as my "queue" because i'm lazy
		{ // shuffle down priority queue O(n)
			for ( int i = 0; i < frontier_len - 1; i++ ) {
				frontier[i] = frontier[i + 1];
				frontier_score[i] = frontier_score[i + 1];
			}
			frontier_len--;
		} // endblock

		{ // check all neighbours to current for frontier adding
			Coord adj[4] = {
				{.x = -1, .y = 0 }, {.x = 1, .y = 0 }, {.x = 0, .y = -1 }, {.x = 0, .y = 1 }
			};
			for ( int i = 0; i < 4; i++ ) {
				Coord next = current;
				next.x += adj[i].x;
				next.y += adj[i].y;

				// validate that adjacent node would be in grid space or off side
				if ( next.x < 0 || next.x >= WORLD_SIZE ) {
					continue;
				}
				if ( next.y < 0 || next.y >= WORLD_SIZE ) {
					continue;
				}
				if ( graph[next.y][next.x].is_obstacle ) {
					continue;
				}

				// work out actual cost of going to neighbour - if cheap than last calc for
				// this node...
				int g = graph[current.y][current.x].cost + ADJACENT_MOVE_COST;
				if ( !graph[next.y][next.x].was_visited ||
						 ( g < graph[next.y][next.x].cost ) ) {
					graph[next.y][next.x].was_visited = true;
					graph[next.y][next.x].cost = g;
					graph[next.y][next.x].parent = current;
					// f(n) = g(n) + h(n)
					int h = heuristic( next, goal );
					frontier_score[frontier_len] = g + h;
					// printf("g + h = %i\n", g + h);
					frontier[frontier_len] = next;
					frontier_len++;
				}
			}
			probe_count++;
		}

		{ // sort - more crappy priority queue O(n^2)
			bool sorted = false;
			while ( !sorted ) {
				sorted = true;
				for ( int i = 0; i < frontier_len - 1; i++ ) {
					if ( frontier_score[i + 1] < frontier_score[i] ) {
						sorted = false;
						Coord tmp = frontier[i + 1];
						frontier[i + 1] = frontier[i];
						frontier[i] = tmp;
						int tmpcost = frontier_score[i + 1];
						frontier_score[i + 1] = frontier_score[i];
						frontier_score[i] = tmpcost;
					}
				} // endfor
			}		// endwhile
		}			// endblock
#ifdef OUTPUT_IMAGES
    write_ppm( goal, frontier, frontier_len );
#endif
	} // endwhile
	printf( "v = %i, visits = %i\n", WORLD_SIZE * WORLD_SIZE, probe_count );
}

void print_path( Coord goal ) {
	Coord parent = graph[goal.y][goal.x].parent;
	printf( "%i,%i\n", goal.x, goal.y );
	while ( parent.x != NO_PARENT && parent.y != NO_PARENT ) {
		printf( "%i,%i\n", parent.x, parent.y );
		parent = graph[parent.y][parent.x].parent;
	}
}

int main() {
	reset_graph();
	{ // create obstacles
		for ( int i = 0; i < WORLD_SIZE; i++ ) {
			graph[3][i].is_obstacle = true;
      graph[6][i].is_obstacle = true;
		}
		graph[3][WORLD_SIZE - 2].is_obstacle = false;
    graph[6][2].is_obstacle = false;
    graph[6][5].is_obstacle = false;
    graph[6][6].is_obstacle = false;
    graph[7][7].is_obstacle = true;
    graph[8][7].is_obstacle = true;
    graph[9][7].is_obstacle = true;
    graph[9][6].is_obstacle = true;
    graph[9][5].is_obstacle = true;
    graph[9][4].is_obstacle = true;
    graph[8][4].is_obstacle = true;
    graph[7][4].is_obstacle = true;
	}
	// the start square and end square (top-left and bottom-right nodes)
	Coord start = ( Coord ){.x = 0, .y = 0 };
	Coord goal = ( Coord ){.x = WORLD_SIZE - 1, .y = WORLD_SIZE - 1 };

	astar( start, goal );
	print_path( goal );

	// f = g + h

	return 0;
}
