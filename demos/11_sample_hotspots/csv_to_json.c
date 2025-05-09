#include <stdbool.h>
#include <stdio.h>
#include <string.h>

#define CSV_ROWS_MAX 256

typedef struct csv_row_t {
  char name[1024];
  char location[1024];
  char text[2048];
  char position_xyz[128];
  char rotation_y_deg[64];
} csv_row_t;

static csv_row_t _rows[CSV_ROWS_MAX];
static int _n_rows;

// returns index of line element after token ends
int _cpy_csv_tok( const char* line, int start_at, int line_len, char* tok_output ) {
  tok_output[0]    = '\0';
  int op_len       = 0;
  bool in_brackets = false;
  // example: ANTON,"something with a comma in it, here",other
  int i = 0;
  for ( i = start_at; i < line_len; i++ ) {
    if ( line[i] == '"' ) {
      in_brackets = !in_brackets;
      printf( "skip b\n" );
      continue; // skip the bracket from output
    }
    if ( ( line[i] == ',' && !in_brackets ) || line[i] == '\n' || line[i] == '\r' ) {
      tok_output[op_len] = '\0';
      return i + 1;
    }
    tok_output[op_len++] = line[i];
  }
  tok_output[op_len] = '\0';
  printf( "token=`%s`\n", tok_output );
  return i + 1;
}

int main( int argc, char** argv ) {
  if ( argc < 3 ) {
    printf( "usage: csv2json MYINPUTFILE.csv MYOUTPUTFILE.json\n" );
    return 0;
  }
  {
    FILE* f_ptr = fopen( argv[1], "r" );
    if ( !f_ptr ) {
      fprintf( stderr, "ERROR opening input file `%s`\n", argv[1] );
      return 1;
    }
    char line[4096];
    while ( fgets( line, 4096, f_ptr ) ) {
      int line_len = strlen( line );
      char token[4096];
      int next_tok_el_idx = _cpy_csv_tok( line, 0, line_len, token );
      strcpy( _rows[_n_rows].name, token );
      next_tok_el_idx = _cpy_csv_tok( line, next_tok_el_idx, line_len, token );
      strcpy( _rows[_n_rows].location, token );
      next_tok_el_idx = _cpy_csv_tok( line, next_tok_el_idx, line_len, token );
      strcpy( _rows[_n_rows].text, token );

      next_tok_el_idx = _cpy_csv_tok( line, next_tok_el_idx, line_len, token );
      strcpy( _rows[_n_rows].position_xyz, token );
      next_tok_el_idx = _cpy_csv_tok( line, next_tok_el_idx, line_len, token );
      strcpy( _rows[_n_rows].rotation_y_deg, token );
      _n_rows++;
    }
    fclose( f_ptr );
  }
  {
    FILE* f_ptr = fopen( argv[2], "w" );
    if ( !f_ptr ) {
      fprintf( stderr, "ERROR opening output file `%s`\n", argv[2] );
      return 1;
    }
    {
      fprintf( f_ptr, "{\n\t\"hotspots\": [\n" );
      for ( int i = 1; i < _n_rows; i++ ) { // skip title row
        fprintf( f_ptr, "\t\t{\n" );
        fprintf( f_ptr, "\t\t\t\"name\": \"%s\",\n", _rows[i].name );
        fprintf( f_ptr, "\t\t\t\"location\": \"%s\",\n", _rows[i].location );
        fprintf( f_ptr, "\t\t\t\"text\": \"%s\",\n", _rows[i].text );
        fprintf( f_ptr, "\t\t\t\"position_xyz\": \"%s\",\n", _rows[i].position_xyz );
        fprintf( f_ptr, "\t\t\t\"rotation_y_deg\": \"%s\"\n", _rows[i].rotation_y_deg );
        if ( i != _n_rows - 1 ) {
          fprintf( f_ptr, "\t\t},\n" );
        } else {
          fprintf( f_ptr, "\t\t}\n" );
        }
      }
      fprintf( f_ptr, "\t]\n}\n" );
    }
    fclose( f_ptr );
  }
  printf( "wrote `%s`\n", argv[2] );
  return 0;
}
