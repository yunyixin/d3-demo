import * as d3 from 'd3';
import styles from './curvedGraph.scss';

export const curvedGraph = (ele, graph) => {
  const maxR = 40;

  const getCoordinate = function (info) {
    const {x1, y1, x2, y2, r2} = info;
    const x21 = x2 - x1;
    const y21 = y2 - y1;
    const length = Math.sqrt(x21 * x21 + y21 * y21);
    const xt = x2 - r2 * x21 / length;
    const yt = y2 - r2 * y21 / length;

    return {xt, yt};
  };

  const circleAreaLinear = (rateValue) => {
    const value = rateValue.split('%')[0];
    const linear = d3.scaleLinear()
      .domain([0, 100])
      .range([0, 1]);

    return linear(value) * maxR;
  };

  const svg = d3.select(ele)
    .append('svg')
    .attr('width', 900)
    .attr('height', 800);

  const width = +svg.attr('width');
  const height = +svg.attr('height');

  const simulation = d3.forceSimulation()
    .force('link', d3.forceLink().id((d) => d.id).distance(function (d) {
      if (d.source.value && d.target.value) {
        const sourceR = circleAreaLinear(d.source.value);
        const targetR = circleAreaLinear(d.target.value);
        return sourceR + targetR + 20;
      }
      return 10;
    }).strength(0.5))
    .force('charge', d3.forceManyBody().strength(-720).distanceMax(400))
    .force('center', d3.forceCenter(width / 2, height / 2));

  const dragstarted = function (d) {
    if (!d3.event.active) {
      simulation.alphaTarget(0.3).restart();
    }
    // const chooseCircle = d3.select(this).select('circle');
    d3.select(this).select('circle').classed(styles.fixed, d.fixed = true);
    d.fx = d.x;
    d.fy = d.y;
  };

  const dragged = function (d) {
    const offsetX = d3.event.sourceEvent.offsetX;
    const offsetY = d3.event.sourceEvent.offsetY;

    if (offsetX > maxR && offsetX < width - maxR && offsetY > maxR && offsetY < height - maxR) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }
    // console.log('offset', offsetX, offsetY);
    // console.log('ed-fx,fy: ', d.fx, d.fy);
  };

  const dragended = function () {
    if (!d3.event.active) {
      simulation.alphaTarget(0);
    }
    // d.fx = null;
    // d.fy = null;
  };

  const color = d3.scaleOrdinal(d3.schemeCategory20);

  // for curved start
  const nodes = graph.nodes.map((d) => ({
    ...d,
    radius: circleAreaLinear(d.value)
  }));
  const links = graph.links;
  const nodeById = d3.map(nodes, function (d) {
    return d.id;
  });
  const bilinks = [];

  links.forEach(function (link) {

    const s = link.source = nodeById.get(link.source);
    const t = link.target = nodeById.get(link.target);
    const i = {}; // intermediate node
    nodes.push(i);
    links.push({source: s, target: i}, {source: i, target: t});
    bilinks.push([s, i, t, link]);

  });

  // for arrow start
  const arrowMarker = svg.append('defs')
    .append('marker')
    .attr('id', 'arrow')
    .attr('markerUnits', 'userSpaceOnUse') // strokeWidth userSpaceOnUse
    .attr('markerWidth', '20')
    .attr('markerHeight', '20')
    .attr('viewBox', '0 0 12 12')
    .attr('refX', '6')
    .attr('refY', '6')
    .attr('orient', 'auto');

  arrowMarker.append('path')
    .attr('d', 'M2,2 L10,6 L2,10 L6,6 L2,2')
    .attr('fill', '#bbb');
  // for arrow end

  const link = svg.append('g')
    .attr('class', styles.links)
    .selectAll('g')
    .data(bilinks)
    .enter().append('g');

  const line = link
    .append('path')
    .attr('stroke-width', 2.5)
    .attr('marker-end', 'url(#arrow)');

  link.append('text').text((d) => d[3].value);

  const node = svg.append('g')
    .attr('class', styles.nodes)
    .selectAll('g')
    .data(nodes.filter(function (d) {
      return d.id;
    }))
    .enter()
    .append('g')
    .on('dblclick', function (d) {
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

  node.filter((d) => d.imageUrl)
    .append('image')
    .attr('xlink:href', (d) => d.imageUrl)
    .attr('width', '30px')
    .attr('height', '25px');


  const ticked = function () {

    line.attr('d', function (d) {
      const info = {
        x1: d[0].x,
        y1: d[0].y,
        x2: d[2].x,
        y2: d[2].y,
        r2: d[2].radius + 8
      };
      const {xt, yt} = getCoordinate(info);

      // `M${xs},${ys}S${d[1].x},${d[1].y} ${xt},${yt}`;
      return `M${d[0].x},${d[0].y}S${d[1].x},${d[1].y} ${xt},${yt}`;
    });

    link.select('text')
      .attr('transform', (d) => {
        // console.log('translate-text-d:', d);
        const pt1 = d[0]; // target
        const pt2 = d[2]; // source
        const cx = (pt1.x + pt2.x) / 2;
        const cy = (pt1.y + pt2.y) / 2 - 5;
        const deg = (pt1.y - pt2.y) / (pt1.x - pt2.x);
        return `translate(${cx},${cy}) rotate(${Math.atan(deg) * 180 / Math.PI}) scale(0.9)`;
      });

    node.attr('transform', (d) => `translate(${d.x},${d.y})`);
    node.select('text').attr('dx', 0).attr('dy', (d) => {
      if (d.imageUrl) {
        return 15;
      }
      return 5;
    });
    node.select('image').attr('x', -12).attr('y', -30);
  };

  simulation
    .nodes(nodes)
    .on('tick', ticked);

  simulation.force('link')
    .links(links);

  // alpha是动画的冷却系数，运动过程中会不断减小，直到小于0.005为止，此时动画会停止。
};