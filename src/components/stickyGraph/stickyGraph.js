import * as d3 from 'd3';

export const stickyGraph = function (ele, graph) {

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
    .force('charge', d3.forceManyBody().strength(-720))
    .force('center', d3.forceCenter(width / 2, height / 2));

  const dragstarted = function (d) {
    if (!d3.event.active) {
      simulation.alphaTarget(0.3).restart();
    }
    d.fx = d.x;
    d.fy = d.y;
  };

  const dragged = function (d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  };

  const dragended = function (d) {
    if (!d3.event.active) {
      simulation.alphaTarget(0);
    }
    d.fx = null;
    d.fy = null;
  };

  const color = d3.scaleOrdinal(d3.schemeCategory20);

  const link = svg.append('g')
    .attr('class', styles.links)
    .selectAll('g')
    .data(graph.links)
    .enter().append('g');

  const line = link
    .append('line')
    .attr('stroke-width', 2.5);

  link.append('text').text((d) => d.value);

  const node = svg.append('g')
    .attr('class', styles.nodes)
    .selectAll('g')
    .data(graph.nodes)
    .enter()
    .append('g')
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

  // alpha是动画的冷却系数，运动过程中会不断减小，直到小于0.005为止，此时动画会停止。

};