import * as d3 from 'd3';
import * as _ from 'lodash';
import styles from './GeographicMap.scss';

export const GeographicMap = function (elem, data, customObject) {

  // console.log('地图数据', customObject);
  const width = customObject.width;
  const height = customObject.height;
  const color1 = customObject.colorFrom;
  const color2 = customObject.colorTo;
  const rangeData = customObject.rangeData;

  // const color = d3.scaleOrdinal(d3.schemeCategory20c);
  const svg = d3.select(elem).append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', 'translate(0,0)');

  const projection = d3.geoMercator()
    .center(customObject.center)
    .scale(customObject.scaleNumber)
    .translate([width / 2, height / 2]);

  const path = d3.geoPath()
    .projection(projection);

  const blocks = svg.selectAll('path')
    .data(data.features)
    .enter()
    .append('path')
    .attr('stroke', '#000')
    .attr('stroke-width', 1)
    .attr('fill', function () {
      return color1;
    })
    .attr('d', path);   // return path(d)
  // .on('mouseover', function () {
  //   console.log('append', d3.select(this));
  //   d3.select(this)
  //     .attr('fill', 'yellow');
  // })
  // .on('mouseout', function (i) {
  //   d3.select(this)
  //     .attr('fill', color(i));
  // });

  svg.selectAll('text')
    .data(data.features)
    .enter()
    .append('text')
    .attr('transform', function (d) {
      // console.log('d', path.centroid(d));
      let x = path.centroid(d)[0] - 20;
      let y = path.centroid(d)[1];
      switch (d.properties.name) {
        // for china
        case '甘肃':
          x = path.centroid(d)[0] + 10;
          y = path.centroid(d)[1];
          break;
        case '内蒙古':
          x = path.centroid(d)[0] + 10;
          y = path.centroid(d)[1] + 10;
          break;
        case '河北':
          x = path.centroid(d)[0] - 20;
          y = path.centroid(d)[1] + 20;
          break;
        case '澳门':
          x = path.centroid(d)[0] - 10;
          y = path.centroid(d)[1] + 15;
          break;
        case '香港':
          x = path.centroid(d)[0] + 10;
          y = path.centroid(d)[1] + 10;
          break;
        case '陕西':
          x = path.centroid(d)[0] - 20;
          y = path.centroid(d)[1] + 20;
          break;
        case '重庆':
          x = path.centroid(d)[0] - 20;
          y = path.centroid(d)[1] + 10;
          break;
        // for chengdu
        case '崇州市':
          x = path.centroid(d)[0] + 10;
          y = path.centroid(d)[1] + 10;
          break;
        case '锦江区':
          x = path.centroid(d)[0] - 8;
          y = path.centroid(d)[1] + 8;
          break;
        case '金牛区':
          x = path.centroid(d)[0] - 20;
          y = path.centroid(d)[1] + 8;
          break;
        default :
          break;
      }
      return `translate(${x},${y})`;
    })
    .text(function (d) {
      return d.properties.name;
    })
    .attr('font-size', 12);

  // for color
  const linear = d3.scaleLinear()
    .domain([0, 2500])
    .range([0, 1]);
  const gradientColor = d3.interpolateRgb(d3.rgb(color1), d3.rgb(color2)); // 红 黄
  // const formatData = function (dataArray) {
  //   dataArray.forEach(function (d) {
  //     console.log(d);
  //   });
  // };

  const rangeColorData = rangeData.results.map((elem) => {
    const color = gradientColor(linear(elem.value));
    return {
      ...elem,
      color
    };
  });

  blocks
    .style('fill', function (d) {
      const object = _.filter(rangeColorData, function (elem) {
        return elem.name === d.properties.name;
      });
      if (object[0]) {
        return object[0].color;
      }
      return color1;
    })
    .on('mouseover', function () {
      d3.select(this).style('fill', 'yellow');
    })
    .on('mouseout', function () {
      d3.select(this).style('fill', function (d) {
        let value = 0;
        rangeData.results.forEach(function (ele) {
          if (ele.name === d.properties.name) {
            value = ele.value;
          }
        });
        const color = gradientColor(linear(value));
        return color;
      });
    });


  // 定义一个线性渐变
  const defs = svg.append('defs');

  const linearGradient = defs.append('linearGradient')
    .attr('id', 'linearColor')
    .attr('x1', '0%')
    .attr('y1', '0%')
    .attr('x2', '100%')
    .attr('y2', '0%');

  // for start
  linearGradient.append('stop')
    .attr('offset', '0%')
    .style('stop-color', color1);

  // for end
  linearGradient.append('stop')
    .attr('offset', '100%')
    .style('stop-color', color2);

  // 添加一个矩形，并应用线性渐变
  svg.append('rect')
    .attr('x', 20)
    .attr('y', height - 80)
    .attr('width', 140)
    .attr('height', 30)
    .style('fill', `url(#${linearGradient.attr('id')})`);

  // 添加文字
  // minValueText
  svg.append('text')
    .attr('class', styles.valueText)
    .attr('x', 20)
    .attr('y', height - 80)
    .attr('dy', '-0.3em')
    .text(function () {
      return 0;
    });

  // maxValueText
  svg.append('text')
    .attr('class', styles.valueText)
    .attr('x', 160)
    .attr('y', height - 80)
    .attr('dy', '-0.3em')
    .text(function () {
      return 2500;
    });

};