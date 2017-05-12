import * as d3 from 'd3';

export const BubbleChart = function (elemment, data) {
  const toJson = (resultes) => resultes.map((result) => ({
    name: result[0],
    value: result[1]
  }));
  const svg = d3.select(elemment)
    .append('svg')
    .attr('text-anchor', 'middle')
    .attr('width', 600)
    .attr('height', 600);
  const width = +svg.attr('width');
  const height = +svg.attr('height');
  const format = d3.format(',d');

  const color = d3.scaleOrdinal(d3.schemeCategory20c);

  const pack = d3.pack()
    .size([width, height])
    .padding(1.5);

  const jsonData = toJson(data.resultset);

  const root = d3.hierarchy({children: jsonData})
    .sum(function (d) {
      return d.value;
    })
    .each(function (d) {
      if (d.data.name) {
        d.name = d.data.name;
        d.package = d.data.name;
      }
    });

  const node = svg.selectAll('.node')
    .data(pack(root).leaves())
    .enter().append('g')
    .attr('class', 'node')
    .attr('transform', function (d) {
      return `translate(${d.x},${d.y})`;
    });

  node.append('circle')
    .attr('id', function (d) {
      return d.name;
    })
    .attr('r', function (d) {
      return d.r;
    })
    .style('fill', function (d) {
      return color(d.package);
    });

  node.append('clipPath')
    .attr('id', function (d) {
      return `clip-${d.name}`;
    })
    .append('use')
    .attr('xlink:href', function (d) {
      return `#${d.name}`;
    });

  node.append('text')
    .attr('clip-path', function (d) {
      return `url(#clip-${d.name})`;
    })
    .selectAll('tspan')
    .data(function (d) {
      return [`${d.value}%`, d.name];
    })
    .enter().append('tspan')
    .attr('x', 0)
    .attr('y', function (d, i, nodes) {
      return 13 + (i - nodes.length / 2 - 0.5) * 16;
    })
    .text(function (d) {
      return d;
    });

  node.append('title')
    .text(function (d) {
      return `${d.name}\n${format(d.value)}`;
    });
};