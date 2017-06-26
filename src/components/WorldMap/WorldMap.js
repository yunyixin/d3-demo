import * as d3 from 'd3';
import * as topojson from 'topojson';
import * as _ from 'lodash';
import styles from './WorldMap.scss';


export class WorldMap {

  constructor(options) {
    this.props = {};
    if (!options ||
      typeof options.dom === 'undefined' ||
      typeof options.mapJson === 'undefined') {
      throw Error('dom and mapJson must be set');
    }

    _.assign(this.props, {
      width: options.width || options.dom.clientWidth,
      height: options.height || options.dom.clientHeight
    }, options);

  }


  zoomed(selector) {
    // console.log('event', d3.event);
    selector.attr('transform', `translate(${d3.event.transform.x},${d3.event.transform.y})scale(${d3.event.transform.k})`);
    // info.attr('transform', `translate(${d3.event.translate})scale(${d3.event.scale})`);
  }

  sizeChange(width) {
    d3.select('g').attr('transform', `scale${width / 1900}`);
    d3.select('svg').attr('height', width / 2);
  }

  render() {
    const {dom, mapJson, width, height} = this.props;
    let map = {};


    const zoomed = function() {
      // console.log('event', d3.event);
      map.attr('transform', `translate(${d3.event.transform.x},${d3.event.transform.y})scale(${d3.event.transform.k})`);
      // info.attr('transform', `translate(${d3.event.translate})scale(${d3.event.scale})`);
    };

    const zoom = d3.zoom()
      .scaleExtent([1, 9])
      .on('zoom', zoomed);

    const svg = d3.select(dom)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%');

    // set background color
    svg.append('rect')
      .attr('class', styles.bgRect)
      .call(zoom);

    // d3.select(window).on('resize', sizeChange);

    map = svg.append('g');
    const projection = d3.geoMercator()
      .translate([width / 2, height / 2])
      .scale(width / 2 / Math.PI);

    const path = d3.geoPath().projection(projection);

    // Map of earth
    map.selectAll('path')
      .data(topojson.feature(mapJson, mapJson.objects.countries).features)
      .enter()
      .append('path')
      .attr('fill', '#95E1D3')
      .attr('stroke', '#266D98')
      .attr('d', path);
    // .call(zoom)
    // This is super jittery for some reason


    // move and scale map and sth-info on interaction

  }
}