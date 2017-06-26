import * as d3 from 'd3';
import * as _ from 'lodash';
import styles from './HeadMap.scss';

export class HeatMap {

  constructor(options) {
    this.props = {};
    if (!options ||
      typeof options.dom === 'undefined' ||
      typeof options.data === 'undefined') {
      throw Error('dom and data must be set');
    }

    _.assign(this.props, {
      // alternatively colorbrewer.YlGnBu[9]
      colors: ['#ffffd9', '#edf8b1', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#253494', '#081d58'],
      days: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
      times: ['1a', '2a', '3a', '4a', '5a', '6a', '7a', '8a', '9a', '10a', '11a', '12a', '1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p', '10p', '11p', '12p']
    }, options);
  }

  heatMapChart(svg, gridSize) {
    const {data, colors} = this.props;

    const colorScale = d3.scaleQuantile()
      // 9 colors
      .domain([0, 8], d3.max(data, function (d) {
        return d.value;
      }))
      .range(colors);

    const cards = svg.selectAll('.hour')
      .data(data, function (d) {
        return `${d.day}:${d.hour}`;
      });

    cards.append('title');

    cards.enter().append('rect')
      .attr('x', function (d) {
        return (d.hour - 1) * gridSize;
      })
      .attr('y', function (d) {
        return (d.day - 1) * gridSize;
      })
      .attr('rx', 4)
      .attr('ry', 4)
      .attr('class', styles.grid)
      .attr('width', gridSize)
      .attr('height', gridSize)
      .style('fill', colors[0]);

    const t = d3.transition()
      .duration(1000)
      .ease(d3.easeLinear);

    d3.selectAll('rect').transition(t)
      .style('fill', function (d) {
        return colorScale(d.value);
      });

    cards.select('title').text(function (d) {
      return d.value;
    });

    cards.exit().remove();

    // add legend
    const legend = svg.selectAll('.legend')
      .data([0].concat(colorScale.quantiles()), function (d) {
        return d;
      })
      .enter().append('g')
      .attr('class', 'legend');
    const legendWidth = gridSize * 2;
    const height = 7 * gridSize + gridSize; // heatmap height and padding


    legend.append('rect')
      .attr('x', function (d, i) {
        return legendWidth * i;
      })
      .attr('y', height)
      .attr('width', legendWidth)
      .attr('height', gridSize / 2)
      .style('fill', function (d, i) {
        return colors[i];
      });

    legend.append('text')
      .attr('class', styles.legendText)
      .text(function (d) {
        return `≥ ${Math.round(d)}`;
      })
      .attr('x', function (d, i) {
        return legendWidth * i;
      })
      .attr('y', height + gridSize);

    legend.exit().remove();
  }

  render() {
    const {dom, days, times} = this.props;
    const margin = {top: 20, right: 20, bottom: 70, left: 40};
    const innerWidth = dom.clientWidth - margin.left;
    const gridSize = Math.floor(innerWidth / 24);


    const svg = d3.select(dom).append('svg')
      .attr('class', styles.heatMap)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // dayLabels
    svg.selectAll('.dayLabel')
      .data(days)
      .enter()
      .append('text')
      .text(function (d) {
        return d;
      })
      .attr('x', 0)
      .attr('y', function (d, i) {
        return i * gridSize;
      })
      .attr('text-anchor', 'end')
      .attr('transform', `translate(-6, ${gridSize / 1.5})`);

    // timeLabels
    svg.selectAll('.timeLabel')
      .data(times)
      .enter()
      .append('text')
      .text(function (d) {
        return d;
      })
      .attr('x', function (d, i) {
        return i * gridSize;
      })
      .attr('y', 0)
      .style('text-anchor', 'middle')
      .attr('transform', `translate(${gridSize / 2}, -6)`);


    this.heatMapChart(svg, gridSize);
  }

}