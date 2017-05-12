/* eslint-disable global-require, no-undef */

// import {netGraph} from './netGraph';
// import {testGraph, curvedGraph} from './components';
// import * as d3 from 'd3';


// const main = () => {
//   const elem1 = document.querySelector('#line');
//   const elem2 = document.querySelector('#curve');
//
//   d3.json('./data/subclass.json', function (error, data) {
//     if (error) {
//       throw error;
//     }
//     testGraph(elem1, data);
//     // curvedGraph(elem2, data);
//   });
//
//   // ReactDOM.render("welcome to webpack", document.querySelector('#root'));
// };
//
// document.addEventListener('DOMContentLoaded', main);

// global objects in browser

if (__DEVELOPMENT__) {
  window.d3 = require('d3');
  window.cloud = require('d3-cloud');
}
window.ForceGraph = require('./components');