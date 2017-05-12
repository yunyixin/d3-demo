import * as d3 from 'd3';
import * as _ from 'lodash';
import styles from './SmartPlot.scss';

export class SmartPlot {

  props = {
    // required
    dom: null,
    data: [{
      title: '',
      points: [
        // {
        //   "x": 0.6140109120748686,
        //   "y": 1.0
        // },
        // ...or
        // {
        //   "x": 0.6140109120748686,
        //   "y": 1.0,
        //   "value": 0.0
        // },
        // ...
      ],
      xAxis: '',
      yAxis: '',
      pointCaption: ''
    }],
    xDomain: [],
    yDomain: [],
    isShowDiagonalLine: false,
    isShowLegends: false,
    isLinked: true,
    isSigned: false,

    // optional
    width: 480,
    height: 300,
    margin: {
      top: 0, right: 0, bottom: 0, left: 0
    }
  };

  tooltip = null;

  constructor(props) {
    this.props = {...this.props, ...props};
  }

  render() {
    const {dom, width, height, margin} = this.props;
    const {data, xDomain, yDomain, isShowDiagonalLine, isShowLegends} = this.props;
    const datasets = _.isArray(data) ? data : [data];

    d3.select(dom).selectAll('*').remove();

    const svg = d3.select(dom).append('svg')
      .attr('class', styles.container)
      .attr('width', width)
      .attr('height', height);

    const _width = width - margin.left - margin.right;
    const _height = height - margin.top - margin.bottom;
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear();
    const y = d3.scaleLinear();

    if (xDomain.length > 0) {
      x.domain(xDomain);
    } else {
      x.domain([0, d3.max(datasets[0].points, (pt) => pt.x)]);
    }

    if (yDomain.length > 0) {
      y.domain(yDomain);
    } else {
      y.domain([0, d3.max(datasets[0].points, (pt) => pt.y)]);
    }

    x.range([0, _width]);
    y.range([_height, 0]);

    // tooltip

    this.tooltip = d3.select(dom).append('div')
      .attr('class', styles.tooltip)
      .style('display', 'none');

    // grid

    const line = d3.line();
    const grids = g.append('g').attr('class', styles.grids);

    const hGrid = grids.append('g');
    hGrid.selectAll('path')
      .data(y.ticks())
      .enter()
      .append('path')
      .attr('d', (d) => line([[0, y(d) + 0.5], [_width, y(d) + 0.5]]));

    const vGrid = grids.append('g');
    vGrid.selectAll('path')
      .data(x.ticks())
      .enter()
      .append('path')
      .attr('d', (d) => line([[x(d) + 0.5, 0], [x(d) + 0.5, _height]]));

    if (isShowDiagonalLine) {
      grids.append('path')
        .style('stroke', '#000')
        .attr('d', line([[x(0), y(0)], [x(1), y(1)]]));
    }

    // graphs
    const colors = d3.scaleOrdinal(d3.schemeCategory20);

    for (let i = 0; i < datasets.length; ++i) {
      const dataset = datasets[i];
      this._drawGraph({
        parent: g.append('g').attr('class', styles.graph),
        points: dataset.points,
        color: colors(i),
        xScale: x,
        yScale: y
      });
    }

    this._drawInteractions({
      parent: g.append('g').attr('class', styles.interaction),
      points: _.reduce(datasets, (prev, next) => prev.concat(next.points), datasets[0].points),
      width: _width,
      height: _height,
      xScale: x,
      yScale: y
    });

    // legends

    if (isShowLegends) {
      const {area, areaName} = datasets[0];
      const legend = g.append('g')
        .attr('class', styles.legends)
        .selectAll('g')
        .data(datasets)
        .enter()
        .append('g')
        .attr('class', styles.legend)
        .attr('transform', (d, i) => `translate(0,${_height + 40 + i * 20})`);

      legend.append('rect')
        .attr('fill', (d, i) => colors(i))
        .attr('width', 30)
        .attr('height', 15);

      legend.append('text')
        .attr('dx', 35)
        .attr('dy', 11)
        .text(() => `${areaName} = ${area}`);
    }

    // axises

    g.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', `translate(0,${_height})`)
      .call(d3.axisBottom(x));

    g.append('g')
      .attr('class', 'axis axis--y')
      .attr('transform', 'translate(0,0)')
      .call(d3.axisLeft(y));

    // labels
    const {title, xAxis, yAxis} = datasets[0];

    g.append('text')
      .text(title)
      .attr('font-size', '.85rem')
      .attr('text-anchor', 'middle')
      .attr('transform', `translate(${_width / 2},-10)`);

    g.append('text')
      .text(xAxis)
      .attr('font-size', '.85rem')
      .attr('text-anchor', 'middle')
      .attr('transform', `translate(${_width / 2},${_height + 35})`);

    g.append('text')
      .text(yAxis)
      .attr('font-size', '.85rem')
      .attr('text-anchor', 'middle')
      .attr('transform', `translate(-35,${_height / 2}) rotate(-90)`);
  }

  _drawGraph({parent, points, color, xScale, yScale}) {
    const {isLinked, isSigned} = this.props;
    const [x, y] = [xScale, yScale];

    if (isSigned) {
      parent.selectAll('circle')
        .data(points)
        .enter()
        .append('circle')
        .attr('transform', (d) => `translate(${x(d.x) + 0.5},${y(d.y) + 0.5})`)
        .attr('fill', color)
        .attr('r', 2.5);
    }

    if (isLinked) {
      const curve = d3.line()
        .x((d) => x(d.x) + 0.5)
        .y((d) => y(d.y) + 0.5)
        .curve(d3.curveLinear);

      parent.append('path')
        .attr('stroke', color)
        .attr('stroke-width', 2)
        .attr('fill', 'none')
        .attr('d', curve(points));
    }
  }

  _drawInteractions({parent, points, width, height, xScale, yScale}) {
    const line = d3.line();
    const [x, y] = [xScale, yScale];

    // cursor related components
    const comp = parent.append('g').attr('class', styles.components);
    const vHover = comp.append('path').attr('class', styles.hover);
    const hHover = comp.append('path').attr('class', styles.hover);
    const circle = comp.append('circle').attr('r', 3).attr('class', styles.circle);
    const xLabel = comp.append('text').attr('class', styles.label);
    const yLabel = comp.append('text').attr('class', styles.label);

    comp.selectAll('*').attr('visibility', 'hidden');

    // polygon masks
    const masks = parent.append('g').attr('class', styles.masks);
    const voronoi = d3.voronoi()
      .extent([[-1, -1], [width + 1, height + 1]])
      .x((pt) => x(pt.x))
      .y((pt) => y(pt.y));

    const mask = masks
      .selectAll('path')
      .data(voronoi.polygons(points))
      .enter()
      .append('path')
      .attr('d', (d) => d ? `M${d.join('L')}Z` : null);

    mask.attr('fill', 'transparent')
    // .attr('stroke', 'red')
    // .attr('stroke-width', 1)
      .on('mouseenter', (d, i) => {
        const {pointCaption} = this.props.data;
        const pt = points[i];
        const format = d3.format(',.5f');

        vHover.attr('d', line([[x(pt.x) + 0.5, 0], [x(pt.x) + 0.5, height]]));
        hHover.attr('d', line([[0, y(pt.y) + 0.5], [width, y(pt.y) + 0.5]]));
        circle.attr('cx', x(pt.x) + 0.5).attr('cy', y(pt.y) + 0.5);
        xLabel.attr('transform', `translate(${x(pt.x) + 1},${height - 1})`).text(format(pt.x));
        yLabel.attr('transform', `translate(1,${y(pt.y) - 1})`).text(format(pt.y));

        comp.selectAll('*').attr('visibility', 'visible');

        const $circle = circle.node();
        const matrix = $circle.getScreenCTM().translate(+$circle.getAttribute('cx'), +$circle.getAttribute('cy'));
        if (typeof pointCaption !== 'undefined' && typeof pt.value !== 'undefined') {
          this.tooltip
            .text(`${pointCaption}: ${format(pt.value)}`)
            .style('left', `${window.pageXOffset + matrix.e - 55}px`)
            .style('top', `${window.pageYOffset + matrix.f + 10}px`)
            .style('display', 'block');
        }
      })
      .on('mouseleave', () => {
        comp.selectAll('*').attr('visibility', 'hidden');
        this.tooltip.style('display', 'none');
      });
  }

}
