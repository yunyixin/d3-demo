import * as d3 from 'd3';
import * as topojson from 'topojson';
import d3Tip from 'd3-tip';
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

  sizeChange(width) {
    d3.select('g').attr('transform', `scale${width / 1900}`);
    d3.select('svg').attr('height', width / 2);
  }

  render() {
    const {dom, mapJson, width, height} = this.props;
    let map = {};

    // color function
    const colors = d3.scaleOrdinal(d3.schemeCategory20b);

    const zoomed = function () {
      map.attr('transform', `translate(${d3.event.transform.x},${d3.event.transform.y})scale(${d3.event.transform.k})`);
      // info.attr('transform', `translate(${d3.event.translate})scale(${d3.event.scale})`);
    };

    const zoom = d3.zoom()
      .scaleExtent([0.5, 9])
      .on('zoom', zoomed);

    const svg = d3.select(dom)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%');

    // set background color
    svg.append('rect')
      .attr('class', styles.bgRect)
      .call(zoom)
      .on('wheel', function () {
        d3.event.preventDefault();
      });

    // 球形墨卡托投影
    const projection = d3.geoMercator()
      .translate([width / 2, height / 1.5])
      .scale(width / 2 / Math.PI);
    const path = d3.geoPath().projection(projection);

    // add tips
    const tip = d3Tip()
      .attr('class', styles.d3Tip)
      // .offset([-10, 0])
      .html(function (d) {
        return `<strong>Number:</strong><span style='color: green'>${d.id}</span>`;
      });
    svg.call(tip);

    // Map of earth
    map = svg.append('g');
    map.selectAll('path')
      .data(topojson.feature(mapJson, mapJson.objects.countries).features)
      .enter()
      .append('path')
      .attr('fill', function (d) {
        return colors(d.id);
      })
      .attr('stroke', '#266D98')
      .attr('d', path)
      .on('mouseover', function (d) {
        tip.show(d);

        d3.select(this)
          .style('opacity', 1)
          .style('stroke', 'white')
          .style('stroke-width', 0.3);
      })
      .on('mouseout', function (d) {
        tip.hide(d);

        d3.select(this)
          .style('opacity', 0.8)
          .style('stroke', 'white')
          .style('stroke-width', 0.3);
      });


  }
}