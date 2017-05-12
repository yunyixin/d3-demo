import * as d3 from 'd3';
import * as _ from 'lodash';
import * as styles from './Pie.scss';

/**
 * @options
 *  - dom         <Element>(*) a HTML Element
 *  - data        <Object>(*)  pie json data
 *  - title       <String>     -
 *  - color       <Function>   pick a color to fill corresponding arc, passed arc index
 *  - innerRadius <Number>     default to 55
 *  - outerRadius <Number>     default to 100
 *
 * @methods
 *  - render() show the Pie
 *
 * @examples
 * var pie = new Pie({
 *   dom: document.querySelector('#playground'),
 *   data: {...}
 * });
 *
 * pie.render();
 */
export class Pie {

  constructor(options) {
    if (!options ||
      typeof options.dom === 'undefined' ||
      typeof options.data === 'undefined') {
      throw Error('dom and data must be set');
    }
    this.props = {};

    _.assign(this.props, {
      title: '',
      color: d3.scaleOrdinal(d3.schemeCategory20c),
      innerRadius: 55,
      outerRadius: 100
    }, options);
  }

  render() {
    const width = this.props.dom.clientWidth;

    d3.select(this.props.dom).selectAll('*').remove();

    const svg = d3.select(this.props.dom).append('svg')
      .attr('class', styles.svg)
      .attr('width', '100%')
      .attr('height', '100%');

    const arc = d3.arc()
      .innerRadius(this.props.innerRadius)
      .outerRadius(this.props.outerRadius)
      .padAngle(0.02);

    const formatPercent = d3.format('.1%');

    let pieData = d3.pie()
      .value(d => d.y)(this.props.data.points);

    const sum = d3.sum(pieData, d => d.value);

    // pre-calculate
    pieData = pieData.map(d => {
      const percent = formatPercent(d.value / sum);

      return {
        ...d,
        extra: {
          percent
        }
      };
    });

    const isNumeric = this.props.data.info.type === 'Numeric';

    // graph
    const graph = svg.append('g')
      .attr('class', styles.graph)
      .attr('transform', () => {
        const legends = this.props.data.points.length;
        let rows = Math.floor(legends / 3);
        rows += (legends - rows * 3 > 0) ? 1 : 0;
        const x = width / 2;
        const y = rows * 25 + this.props.outerRadius + 10;
        return `translate(${x},${y})`;
      });

    // legend
    const legendArea = svg.append('g')
      .attr('transform', 'translate(0,0)');

    const legend = legendArea.selectAll('g')
      .data(pieData)
      .enter()
      .append('g')
      .attr('class', styles.legend)
      .attr('transform', (d, i) => {
        const x = i % 3 * 120;
        const y = Math.floor(i / 3) * 25;
        return `translate(${x},${y})`;
      })
      .attr('id', (d, i) => `legend-${i}`)
      .on('mouseenter', (d, i) => graph.select(`g#arc-${i}`).classed(styles.hover, true))
      .on('mouseleave', (d, i) => graph.select(`g#arc-${i}`).classed(styles.hover, false));

    legend.append('rect')
      .style('fill', (d, i) => this.props.color(i))
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 40)
      .attr('height', 20);

    legend.append('text')
      .attr('dx', 45)
      .attr('dy', 15)
      .text(d => {
        if (isNumeric) {
          const from = _.truncate(d.data.x1, {length: 5});
          const to = _.truncate(d.data.x2, {length: 5});
          return `${from}-${to}`;
        } else {
          return _.truncate(d.data.x1, {length: 8});
        }
      })
      .append('title')
      .text(d => isNumeric ? `${d.data.x1}-${d.data.x2}` : d.data.x1);

    // title
    graph.append('g').append('text')
      .attr('class', styles.title)
      .attr('dx', -2)
      .attr('dy', 3)
      .text(this.props.title);

    // arcs
    const part = graph.append('g').selectAll('g')
      .data(pieData)
      .enter()
      .append('g')
      .attr('id', (d, i) => `arc-${i}`)
      .attr('class', styles.part)
      .on('mouseenter', (d, i) => legendArea.select(`g#legend-${i}`).classed(styles.hover, true))
      .on('mouseleave', (d, i) => legendArea.select(`g#legend-${i}`).classed(styles.hover, false));

    part.append('path')
      .style('fill', (d, i) => this.props.color(i))
      .attr('d', d => arc({
        startAngle: d.startAngle,
        endAngle: d.endAngle
      }));

    // percentage label
    part.append('text')
      .attr('transform', d => `translate(${arc.centroid(d)})`)
      .text(d => d.extra.percent);
  }

}
