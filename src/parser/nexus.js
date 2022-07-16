import {object, compact, reject, map, mapObject, rest, filter, each} from "lodash-es";
import {default as newickParser} from "./newick";

export function parseAnnotations (buf) {

  let str = buf;
  let index = str.toUpperCase().indexOf('BEGIN DATA;');
  let data = str.slice(index);

  if(data.length < 2) {
    return '';
  }

  index = data.toUpperCase().indexOf('END;');
  let data_str = data.slice(0, index);

  // split on semicolon
  data = map(data_str.split(';'), d => { return d.trim() } );

  // get dimensions
  let dimensions = filter(data, d => {return d.toUpperCase().startsWith('DIMENSION')}); 
  dimensions = dimensions[0].split(' ');
  dimensions = object(map(rest(dimensions), d => { return d.split('=') }));

  // get formats
  let format = filter(data, d => {return d.toUpperCase().startsWith('FORMAT')}); 
  format = format[0].split(' ');
  format = object(map(rest(format), d => { return d.split('=') }));
  format.symbols = reject(format.symbols.split(""), d => d=='"');

  // get character matrix
  let matrix = filter(data, d => {return d.toUpperCase().startsWith('MATRIX')}); 
  matrix = matrix[0].split('\n')
  matrix = object(map(rest(matrix), d=> { return compact(d.split(' ')) }));

  // create all possible states for matrix
  matrix = mapObject(matrix, (v,k) => { 

    if(v == '?') {
      return format.symbols
    }
    else { 
      return Array(v)
    }
  
  });

  return { 'dimensions' : dimensions, 'format' : format, 'matrix' : matrix }

}

/**
 *  Loads annotations from a nexus-formatted buffer and annotates existing tree
 *  nodes appropriately.
 *
 * @param {Object} tree - Instatiated phylotree
 * @param {String} NEXUS string
 * @returns {Object} Annotations
 */
export function loadAnnotations(tree, label, annotations) {

  // if filename, then load from filesystem
  each(tree.getTips(), d => { d.data["test"] = annotations.matrix[d.data.name] });

  // decorate nodes with annotations

}

export default function loadTree(buf) {

  // if filename, then load from filesystem
  // Parse first tree from NEXUS file and send to newickParser

  // Make all upper case
  let str = buf;

  // Get TREE block
  let index = str.toUpperCase().indexOf('BEGIN TREES;');
  let split = str.slice(index);

  if(split.length < 2) {
    return '';
  }

  index = split.toUpperCase().indexOf('END;');
  let tree_str = split.slice(0, index);

  // Filter lines that start with TREE
  let trees = tree_str.split('\n');
  trees = filter(trees, d => { return d.trim().toUpperCase().startsWith('TREE') });

  // Identify start of newick string
  return newickParser(trees[0]);

}

