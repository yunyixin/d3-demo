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
      .attr('class', 'capitals');

    const geoLocation = capitals.map((d) => ({
      ...d,
      geo: projection([d.CapitalLongitude, d.CapitalLatitude])
    }));

    capitalsGroup.append('g')
      .selectAll('.point')
      .data(geoLocation)
      .enter()
      .append('svg:circle')
      .attr('class', styles.point)
      .attr('cx', function (d) {
        console.log('d', d.geo);
        return d.geo[0];
      })
      .attr('cy', function (d) {
        return d.geo[1];
      })
      .attr('r', 8);


    capitalsGroup.append('g')
      .selectAll('.pointText')
      .data(geoLocation)
      .enter()
      .append('text')
      .attr('class', styles.pointText)
      .attr('x', function (d) {
        return d.geo[0] + 2;
      })
      .attr('y', function (d) {
        return d.geo[1] + 2;
      })
      .text(function (d) {
        return d.CapitalName;
      });

    return capitalsGroup;
  }

  addMeteorite(svg, projection) {
    const {meteorite} = this.props;

    const meteoriteGroup = svg.append('g')
      .attr('class', 'meteorites');

    const meteoriteLoc = meteorite.features.map(d => ({
      ...d,
      loc: projection([d.properties.reclong, d.properties.reclat])
    }));


    meteoriteGroup.selectAll('path')
      .data(meteoriteLoc)
      .enter()
      .append('circle')
      .attr('cx', function (d) {
        return d.loc[0];
      })
      .attr('cy', function (d) {
        return d.loc[1];
      })
      .attr('r', function (d) {
        const range = 718750 / 2 / 2;

        if (d.properties.mass <= range) {
          return 2;
        } else if (d.properties.mass <= range * 2) {
          return 10;
        } else if (d.properties.mass <= range * 3) {
          return 20;
        } else if (d.properties.mass <= range * 20) {
          return 30;
        } else if (d.properties.mass <= range * 100) {
          return 40;
        }

        return 50;
      })
      .attr('opacity', 0.6)
      .attr('fill', 'red');

    return meteoriteGroup;
  }

  render() {
    const {dom, mapJson, width, height} = this.props;
    let map = {};
    let circles = {};

    // color function
    const colors = d3.scaleOrdinal(d3.schemeCategory20b);

    const zoomed = function () {
      map.attr('transform', `translate(${d3.event.transform.x},${d3.event.transform.y})scale(${d3.event.transform.k})`);
      circles.attr('transform', `translate(${d3.event.transform.x},${d3.event.transform.y})scale(${d3.event.transform.k})`);
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
    circles = this.addMeteorite(svg, projection); // this.addCapitals(svg, projection);


  }
}