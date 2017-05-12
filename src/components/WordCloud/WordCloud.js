import * as d3 from 'd3';
import cloud from 'd3-cloud';
import styles from './WordCloud.scss';

export const WordCloud = function (elem, data) {

  // console.log('data', data);
  const width = 300;
  const height = 300;
  const type = 'archimedean'; // rectangular spiral archimedean
  const fill = d3.schemeCategory20b;

  data.sort((a, b) => b.num - a.num);

  const limitNumber = data.length;
  const limitData = data.slice(0, limitNumber);
  const min = +data[data.length - 1].num;
  const max = +data[0].num;
  const scale = d3.scaleLinear()
    .range([10, 40])
    .domain([min, max])
    .nice();

  // const destory = (dom) => {
  //   d3.select(dom).selectAll('*').remove();
  // };

  const draw = (words, layout) => {
    // console.log('words', words);
    d3.select(elem).append('svg')
      .attr('class', styles.cloud)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${layout.size()[0] / 2}, ${layout.size()[1] / 2})`)
      .selectAll('text')
      .data(words)
      .enter().append('text')
      .style('font-family', d => d.font)
      .style('fill', (d, i) => fill[i])
      .attr('text-anchor', 'middle')
      .attr('transform', d => `translate(${d.x}, ${d.y}) rotate(${d.rotate})`)
      .style('font-size', '1px')
      .transition()
      .duration(1e3)
      .style('font-size', d => `${d.size}px`)
      .text(d => d.text);

    d3.selectAll('text')
      .on('click', function (d) {
        console.log('click-cloud', d);
      });
  };

  const dataArray = limitData.map((d) => ({
    text: d.name,
    size: scale(+d.num)
  }));

  const layout = cloud()
    .size([width, height])
    .words(dataArray)
    .padding(1)
    .rotate(() => 0)
    .font('serif')  // serif Impact
    .fontSize(function (d) {
      return d.size;
    })
    .spiral(type)
    .on('end', (words) => draw(words, layout));

  // const svg = d3.select(elem).select('svg');
  // const clipCircle = svg.selectAll('g')
  //   .append('circle')
  //   .attr('id', 'clip-circle')
  //   .attr('r', '160')
  //   .style('fill', 'red');
  //
  // svg.append('clipPath')
  //   .attr('id', function (d) {
  //     return `clip-cloud`;
  //   })
  //   .append('use')
  //   .attr('xlink:href', '#clip-circle');
  //
  // svg.attr('clip-path', function (d) {
  //   return `url(#clip-cloud)`;
  // });
  // destory(elem);

  layout.start();

};