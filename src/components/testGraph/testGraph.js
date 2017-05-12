import * as d3 from 'd3';
import styles from './testGraph.scss';

export const testGraph = (ele, graph) => {

  // const getCoordinate = function (info) {
  //   const {x1, y1, x2, y2, r2} = info;
  //   const x21 = x2 - x1;
  //   const y21 = y2 - y1;
  //   const length = Math.sqrt(x21 * x21 + y21 * y21);
  //   const xt = x2 - r2 * x21 / length;
  //   const yt = y2 - r2 * y21 / length;
  //
  //   return {xt, yt};
  // };

  const circleAreaLinear = (rateValue) => {
    const value = rateValue.split('%')[0];

    const linear = d3.scaleLinear()
      .domain([0, 100])
      .range([0, 1]);
    const r = 40;

    return linear(value) * r;
  };

  const svg = d3.select(ele)
    .append('svg')
    .attr('width', 700)
    .attr('height', 800);

  const width = +svg.attr('width');
  const height = +svg.attr('height');

  const simulation = d3.forceSimulation()
    .force('link', d3.forceLink().id((d) => d.id).distance(120))
    .force('charge', d3.forceManyBody().strength(-420))
    .force('collision', d3.forceCollide(1))
    .force('center', d3.forceCenter(width / 2, height / 2));

  const dragstarted = function (d) {
    if (!d3.event.active) {
      simulation.alphaTarget(0.3).restart();
    }
    d3.select(this).select('circle').classed(styles.fixed, d.fixed = true);
    d.fx = d.x;
    d.fy = d.y;
  };

  const dragged = function (d) {
    // console.log('d-ed', d);
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  };

  const dragended = function (d) {
    if (!d3.event.active) {
      simulation.alphaTarget(0);
    }

    if (!d.fixed) {   // invalid
      d.fx = null;
      d.fy = null;
    }
  };

  const color = d3.scaleOrdinal(d3.schemeCategory20);

  // for arrow start
  const arrowMarker = svg.append('defs')
    .append('marker')
    .attr('id', 'arrow')
    .attr('markerUnits', 'strokeWidth')
    .attr('markerWidth', '12')
    .attr('markerHeight', '12')
    .attr('viewBox', '0 0 12 12')
    .attr('refX', '20')
    .attr('refY', '6')
    .attr('orient', 'auto');

  arrowMarker.append('path')
    .attr('d', 'M2,2 L10,6 L2,10 L6,6 L2,2')
    .attr('fill', '#bbb');
  // for arrow end

  const link = svg.append('g')
    .attr('class', styles.links)
    .selectAll('g')
    .data(graph.links)
    .enter().append('g');

  const line = link
    .append('line')
    .attr('stroke-width', 2.5)
    .attr('marker-end', 'url(#arrow)');

  link.append('text').text((d) => d.value);

  const node = svg.append('g')
    .attr('class', styles.nodes)
    .selectAll('g')
    .data(graph.nodes)
    .enter()
    .append('g')
    .on('dblclick', function (d) {
      // console.log('dblclick', d3.select(this));
      d.fx = null;
      d.fy = null;
      d3.select(this).select('circle').classed(styles.fixed, d.fixed = false);
    })
    .call(d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended));

  node
    .append('circle')
    .attr('r', function (d) {
      return circleAreaLinear(d.value);
    })
    .attr('fill', function (d) {
      return color(+d.group + 2);
    });

  node.append('text')
    .text(function (d) {
      return d.text;
    });
  // node.on('dblclick', function (d,i) {
  //   console.log('node_dbclick:', d , i);
  // });
  // node.on('click', function (d,i) {
  //   console.log('node_click:', d , i);
  // });
  //
  // link.on('click', function (d,i) {
  //   console.log('link_click:', d , i);
  // });
  //
  // node.on('mouseover', function (d, i) {
  //   console.log('node_mouseover:', d , i);
  // });

  const ticked = function () {

    line
      .attr('x1', function (d) {
        return d.source.x;
      })
      .attr('y1', function (d) {
        return d.source.y;
      })
      .attr('x2', function (d) {
        return d.target.x;
      })
      .attr('y2', function (d) {
        return d.target.y;
      });

    link.select('text')
      .attr('transform', (d) => {
        const pt1 = d.source;
        const pt2 = d.target;
        const cx = (pt1.x + pt2.x) / 2;
        const cy = (pt1.y + pt2.y) / 2 - 5;
        const deg = (pt1.y - pt2.y) / (pt1.x - pt2.x);
        return `translate(${cx},${cy}) rotate(${Math.atan(deg) * 180 / Math.PI}) scale(0.9)`;
      });

    node.attr('transform', (d) => `translate(${d.x},${d.y})`);
    node.select('text').attr('dx', 0).attr('dy', 5);
  };

  simulation
    .nodes(graph.nodes)
    .on('tick', ticked);

  simulation.force('link')
    .links(graph.links);

  // simulation.stop();

  // alpha是动画的冷却系数，运动过程中会不断减小，直到小于0.005为止，此时动画会停止。
};