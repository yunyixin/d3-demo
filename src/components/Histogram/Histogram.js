import * as d3 from 'd3';
import * as _ from 'lodash';
import * as styles from './Histogram.scss';

/**
 * @options
 *  necessary
 *    - dom        <Element>(*) a HTML Element
 *    - data       <Object>(*)  json
 *  optional
 *    - width      <Number>     -
 *    - height     <Number>     -
 *    - xName      <String>     x axis of name
 *    - yName      <String>     y axis of name
 *    - isMultiple <Boolean>    true or false judge whether the histogram is group
 *    - isRange    <Boolean>    true or false judge whether the histogram is range
 *    - isIcon     <Boolean>    true or false judge whether the histogram is icon
 *
 * @methods
 *  - render() render the histogram
 *  - renderIcon() render the histogram Icon
 *  - destroy(dom) destroy the dom
 *
 * @examples
 * var histogram = new Histogram({
 *   dom: document.getElementById('playground'),
 *   data: {...}
 * });
 *
 * histogram.render();
 */
export class Histogram {
  constructor(options) {
    if (!options ||
      typeof options.dom === 'undefined' ||
      typeof options.data === 'undefined') {
      throw Error('dom and data must be set');
    }

    this.init(options);
  }

  init(options) {
    this.dom = options.dom;
    this.data = options.data.points;
    this.width = options.width || this.dom.clientWidth;
    this.height = options.height || this.dom.clientHeight;
    this.xName = options.xName || options.data.info.colName;
    this.yName = options.yName || 'frequency';
    this.isMultiple = options.isMultiple || false;
    this.isRange = options.isRange || options.data.info.type === 'Numeric' || false;
    this.isIcon = options.isIcon || false;
  }

  render() {
    this.destroy(this.dom);

    const data = this.data;
    let {width, height} = this;
    if (!this.isIcon) {
      width = this.width - 80;
      height = this.height - 70;
    }

    const color = d3.scaleOrdinal()
      .range(['#a05d56', '#d0743c', '#ff8c00']);
    const x = d3.scaleBand()
      .range([0, width])
      .padding(0.3);
    const y = d3.scaleLinear()
      .rangeRound([height, 0]);
    const x0 = d3.scaleBand();

    if (this.isMultiple) {
      x.domain(this.data.map(d => d.group));
      y.domain([0, d3.max(this.data, d => d3.max(d.labels, d => +d.y))]);
      x0.domain(this.data[0].labels.map(d => d.x1))
        .range([0, x.bandwidth()]);
    } else {
      x.domain(this.data.map(d => d.x1));
      y.domain([0, d3.max(this.data, d => +d.y)]);
    }

    if (this.isIcon) {
      this.svg = d3.select(this.dom)
        .append('svg')
        .attr('class', styles.container)
        .attr('width', width)
        .attr('height', height)
        .append('g');
    } else {
      this.svg = d3.select(this.dom)
        .append('svg')
        .attr('class', styles.container)
        .attr('width', '100%')
        .attr('height', '100%')
        .append('g')
        .attr('transform', 'translate(60, 10)');

      this.svg.append('g')
        .attr('class', `x ${styles.axis}`)
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(x));
      this.svg.append('g')
        .attr('class', `y ${styles.axis}`)
        .call(d3.axisLeft(y));

      if (this.isRange) {
        const text = this.svg
          .select('.x')
          .append('g')
          .attr('class', 'tick')
          .style('opacity', 1)
          .append('text')
          .attr('fill', '#000')
          .attr('y', 9)
          .attr('x', 0.5)
          .attr('dy', '.75em');
        if (this.isMultiple) {
          text.text(_.last(this.data).group);
        } else {
          text.text(_.last(this.data).x2);
        }

        this.svg.selectAll('.x .tick')
          .each(function(name, index) {
            d3.select(this).attr('transform', () => {
              let xWidth = 0;
              if (index === 0) {
                xWidth = 0;
              } else if (index === data.length) {
                xWidth = width;
              } else {
                xWidth = x.paddingOuter() * x.step() + (index - 1) * x.step() + x.bandwidth() + (x.paddingInner() * x.step()) / 2;
              }
              return `translate(${xWidth}, 0)`;
            });
          });
      }
      this.truncateScaleValue();

      // set axis name
      this.svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -60)
        .attr('x', -(height / 2))
        .attr('dy', '.71em')
        .style('text-anchor', 'middle')
        .text(this.yName);
      this.svg.append('text')
        .attr('x', width / 2)
        .attr('y', height + 45)
        .attr('dy', '.75em')
        .style('text-anchor', 'middle')
        .text(this.xName);
    }

    let title = {};
    if (this.isMultiple) {
      const group = this.svg
        .selectAll('.group')
        .data(this.data)
        .enter().append('g')
        .attr('transform', d => `translate(${x(d.group)}, 0)`);
      title = group.selectAll('.rect')
        .data(d => d.labels)
        .enter().append('rect')
        .attr('class', styles.bar)
        .style('fill', d => color(d.x1))
        .attr('x', d => x0(d.x1))
        .attr('y', height)
        .attr('width', x0.bandwidth())
        .attr('height', 0)
        .append('title');
    } else {
      title = this.svg
        .selectAll('.rect')
        .data(this.data)
        .enter().append('rect')
        .attr('class', styles.bar)
        .attr('x', d => x(d.x1))
        .attr('y', height)
        .attr('width', x.bandwidth())
        .attr('height', 0)
        .append('title');
    }
    this.svg.selectAll('rect').transition()
      .duration(500)
      .attr('height', d => height - y(+d.y))
      .attr('y', d => y(+d.y));

    if (this.isMultiple) {
      title.text(d => `${d.x1}: ${d.y}`);
    } else if (this.isRange) {
      title.text(d => `${this.xName}: ${d.x1}~${d.x2}\n${this.yName}: ${d.y}`);
    } else {
      title.text(d => `${this.xName}: ${d.x1}\n${this.yName}: ${d.y}`);
    }
  }

  truncateScaleValue() {
    // the value of X axis is too big, so add ellipsis for value
    const texts = this.svg.selectAll('.x text');
    if (this.isRange) {
      _.last(texts._groups[0]).__data__ = _.last(texts._groups[0]).innerHTML;
    }
    texts.attr('transform', 'rotate(-35)')
      .style('text-anchor', 'end')
      .text(d => _.truncate(d, {'length': 9, 'omission': '...'}))
      .append('title')
      .text(d => d);

    // the value of Y axis is too big, so add ellipsis for value
    this.svg.selectAll('.y text')
      .text((d, i, groupList) => {
        let value = groupList[i].textContent;
        if (this.isTransferUnit() && value >= 1000) {
          value = `${value / 1000}k`;
        }
        return _.truncate(value, {'length': 9, 'omission': '...'});
      })
      .append('title')
      .text(d => d);
  }

  isTransferUnit() {
    _.find(this.data.attribute, function(d) {
      if (!isNaN(+d) && +d > 10000) {
        return true;
      }
    });
    return false;
  }

  destroy(dom) {
    d3.select(dom).selectAll('*').remove();
  }
}