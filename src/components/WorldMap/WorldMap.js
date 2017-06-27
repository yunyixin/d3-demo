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

  addCapitals(svg, projection) {
    const {capitals} = this.props;

    const capitalsGroup = svg.append('g')
      .attr('class', 'gpoint');


    const point = capitalsGroup.append('g');
    const geo = function (d) {
      return projection(d.CapitalLongitude, d.CapitalLatitude);
    };

    point.selectAll('.point')
      .data(capitals)
      .enter()
      .append('svg:circle')
      .attr('cx', function (d) {
        if (d.CapitalLongitude < 0) {
          return 0;
        }
        return geo(d)[0];
      })
      .attr('cy', function (d) {
        return geo(d)[1];
      })
      .attr('class', styles.point)
      .attr('r', 1.5);

    point.selectAll('text')
      .data(capitals)
      .append('text')
      .attr('x', function (d) {
        return projection(d.CapitalLongitude, d.CapitalLatitude)[0] + 2;
      })
      .attr('y', function (d) {
        return projection(d.CapitalLongitude, d.CapitalLatitude)[1] + 2;
      })
      .attr('class', styles.pointText)
      .text(function (d) {
        return d.CapitalName;
      });


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
        return `<strong>Id：</strong><span style='color: green'>${d.id}</span><br><strong>Country：</strong><span style='color: green'>${d.properties.name}</span>`;

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

    // add some capitals from external csv file
    // this.addCapitals(svg, projection);
  }
}