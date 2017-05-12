import * as d3 from 'd3';
import * as _ from 'lodash';
import * as styles from './Area.scss';

/**
 * @options
 *  - dom  <Element>(*)  a HTML Element
 *  - data <Object>(*)   useful json data
 *  - grid <Boolean>     display the background grid, default value: true
 *  - color<String>     the area's color. default value : green
 *  - opacity<Number>   it's value between 0-1. default value: 0.2
 *
 * @methods
 *  - render() render the roc area
 *
 * @examples
 * var Area = new Area({
 *   dom: document.getElementById('areaTest'),
 *   data: {...},
 *   grid: false,
 *   color: 'red'
 *   opacity: 0.2
 * });
 *
 * Area.render();
 */

export class Area {

  constructor(options) {
    this.props = {};
    if (!options ||
      typeof options.dom === 'undefined' ||
      typeof options.data === 'undefined') {
      throw Error('dom and data must be set');
    }
    if (typeof options.opacity !== 'undefined') {
      if (options.opacity > 1 || options.opacity < 0) {
        throw Error('opacity must between 0-1');
      }
    }
    _.assign(this.props, {
      title: options.data.info.colName,
      grid: true,
      color: 'green',
      opacity: 0.2
    }, options);
  }

  processingData() {
    const media = [];
    for (const elem of this.props.data.points) {
      if (this.props.data.info.type === 'String') {
        media.push({
          x: elem.x1,
          y: +elem.y
        });
      }
      if (this.props.data.info.type === 'Numeric') {
        media.push({
          x: +elem.x1,
          y: +elem.y
        });
      }
    }
    return media;
  }

  render() {
    const data = this.processingData();
    const type = this.props.data.info.type;
    const width = this.props.dom.clientWidth;
    const height = this.props.dom.clientHeight;
    const margin = {top: 20, right: 20, bottom: 70, left: 60};
    const g_width = width - margin.left - margin.right;
    const g_height = height - margin.top - margin.bottom;

    d3.select(this.props.dom).selectAll('*').remove();
    const g = d3.select(this.props.dom)
      .append('svg')
      .attr('class', styles.svg)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    g.append('text')
      .attr('transform', `translate(${g_width / 2},${g_height + 60})`)
      .text(`${this.props.title}`)
      .style('fill', 'black')
      .style('text-anchor', 'middle');

    g.append('text')
      .text('frequency')
      .attr('transform', 'rotate(-90)')
      .attr('x', -g_height / 2)
      .attr('y', -margin.left + 14)
      .style('fill', 'black')
      .style('text-anchor', 'middle')
      .style('font-size', '16px');


    const xx = d3.scaleLinear()
      .domain([0, data.length - 1])
      .range([0, g_width]);

    let scale_x = d3.scaleLinear()
      .domain([d3.min(data, d => d.x), d3.max(data, d => d.x)])
      .range([0, g_width]);

    const scale_y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.y)])
      .range([g_height, 0]);

    if (d3.min(data, d => d.y) === d3.max(data, d => d.y)) {
      scale_y.domain([0, d3.max(data, d => d.y)]);
    }

    const scale_x_rect = d3.scaleLinear()
      .domain([0, 10])
      .range([0, g_width]);

    if (type === 'String') {
      scale_x = d3.scaleBand()
        .domain(data.map(d => d.x))
        .range([0, g_width])
        .paddingInner(2);
    }
    const x_axis = d3.axisBottom().scale(scale_x).tickValues(data.map(d => d.x));
    const y_axis = d3.axisLeft().scale(scale_y);

    const x_format = _.find(data, (d) => d.x >= 10000);
    const y_format = _.find(data, (d) => d.y >= 10000);

    if (y_format) {
      y_axis.tickFormat(d => {
        if (d / 1000 === 0) {
          return 0;
        }
        return `${d / 1000}k`;
      });
    }

    if (x_format && type === 'Numeric') {
      x_axis.tickFormat(d => `${d / 1000}k`);
    }


    const area_generator = d3.area()
      .x(d => scale_x(d.x))
      .y0(g_height)
      .y1(d => scale_y(d.y));

    if (this.props.grid) {
      if (type === 'String') {
        const grid_x = g.selectAll('.grid')
          .data(xx.ticks())
          .enter()
          .append('g')
          .attr('class', styles.grid);
        grid_x.append('line')
          .attr('x1', xx)
          .attr('x2', xx)
          .attr('y1', g_height)
          .attr('y2', 0);
      }
      if (type === 'Numeric') {
        x_axis.tickSize(-g_height);
      }
      const grid_y = g.selectAll('.grid')
        .data(scale_y.ticks())
        .enter()
        .append('g')
        .attr('class', styles.grid);
      grid_y.append('line')
        .attr('y1', scale_y)
        .attr('y2', scale_y)
        .attr('x1', 0)
        .attr('x2', g_width);
    }

    g.append('path').attr('d', area_generator(data))
      .style('stroke', this.props.color)
      .style('fill', this.props.color)
      .style('opacity', this.props.opacity);

    g.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', styles.circle)
      .style('fill', this.props.color)
      .attr('cx', area_generator.x())
      .attr('cy', area_generator.y1())
      .attr('r', 3.5);

    const axis_x = g.append('g').call(x_axis)
      .attr('transform', `translate(0,${g_height})`);

    axis_x.selectAll('g').select('text').attr('transform', 'rotate(-35)')
      .text(d => _.truncate(d, {'length': 9, 'omission': '...'}))
      .style('text-anchor', 'end');
    axis_x.selectAll('g').select('line').attr('stroke', '#aabbcc');

    g.append('g').call(y_axis).selectAll('g');

    const rect = g.selectAll('.bar')
      .data([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
      .enter()
      .append('rect')
      .attr('class', styles.rect)
      .attr('x', d => scale_x_rect(d) - g_width / 7)
      .attr('width', g_width / 10)
      .attr('y', 0)
      .attr('height', g_height);

    const tips = d3.select(this.props.dom)
      .append('div')
      .attr('class', styles.tips);

    if (type === 'Numeric') {
      let current_circle = '';
      const displayTips = X => {
        const x = scale_x.invert(X);
        const i = (d3.bisector(function (d) {
          return d.x;
        }).left)(data, x, 1);
        const d0 = data[i - 1];
        const d1 = data[i] || {};
        const d = x - d0.x > d1.x - x ? d1 : d0;
        const dx = scale_x(d.x) + 100 > g_width ? g_width - 40 : scale_x(d.x) + margin.left;
        const dy = scale_y(d.y) + 45 > g_height ? scale_y(d.y) - 20 : scale_y(d.y) + 46;

        tips.html(`&nbsp;&nbsp;x:&nbsp;${d.x}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\n&nbsp;&nbsp;y:&nbsp;${d.y}`)
          .style('left', `${dx}px`)
          .style('top', `${dy - height}px`)
          .style('opacity', 0.8)
          .style('display', 'block');
        return d;
      };
      rect.on('mouseover', function () {
        d3.selectAll('circle').each(function (p) {
          if (p.x === displayTips(d3.mouse(this)[0]).x && p.y === displayTips(d3.mouse(this)[0]).y) {
            current_circle = d3.select(this).attr('r', 6);
          }
        });

      }).on('mouseout', function () {
        current_circle.attr('r', 3.5);
        tips.style('display', 'none');
      });
    }

    if (type === 'String') {
      let current_circle = '';
      const displayTips = X => {
        const x = xx.invert(X);
        const d = data[_.round(x)];
        const dx = xx(_.round(x)) - margin.left + 150 > g_width ? g_width - 150 + margin.left : xx(_.round(x));
        const dy = scale_y(d.y) + 45 > g_height ? scale_y(d.y) - 20 : scale_y(d.y) + 46;
        tips.html(`&nbsp;&nbsp;x:&nbsp;${d.x}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\n&nbsp;&nbsp;y:&nbsp;${d.y}`)
          .style('width', '150px')
          .style('left', `${dx}px`)
          .style('top', `${dy - height}px`)
          .style('opacity', 0.8)
          .style('display', 'block');
        return d;
      };
      rect.on('mouseover', function () {
        d3.selectAll('circle').each(function (p) {
          if (p.x === displayTips(d3.mouse(this)[0]).x && p.y === displayTips(d3.mouse(this)[0]).y) {
            current_circle = d3.select(this).attr('r', 6);
          }
        });
      }).on('mouseout', function () {
        current_circle.attr('r', 3.5);
        tips.style('display', 'none');
      });

    }

  }

}
