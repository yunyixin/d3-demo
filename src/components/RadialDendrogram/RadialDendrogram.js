import * as d3 from 'd3';
import * as _ from 'lodash';
import styles from './RadialDendrogram.scss';

export class RadialDendrogram {

  constructor(options) {
    if (!options ||
      typeof options.dom === 'undefined') {
      throw Error('dom must be set');
    }
    this.props = {};

    _.assign(this.props, {
      width: 960,
      height: 860,
      data: []
    }, options);
  }

  static draw(data, params) {
    const {dom, width, height} = params;

    const project = function (x, y) {
      const angle = (x - 90) / 180 * Math.PI;
      const radius = y;

      return [radius * Math.cos(angle), radius * Math.sin(angle)];
    };
    dom.innerHTML = '';
    const svg = d3.select(dom)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2},${height / 2 + 20})`);

    const stratify = d3.stratify()
      .parentId(function (d) {
        return d.id.substring(0, d.id.lastIndexOf('.'));
      });

    const cluster = d3.cluster()
      .size([360, width / 2 - 120]);


    const root = stratify(data)
      .sort(function (a, b) {
        return a.height - b.height || a.id.localeCompare(b.id);
      });

    // const root = d3.hierarchy(data)
    //   .sort(function (a, b) {
    //     return a.height - b.height || a.data.name.localeCompare(b.data.name);
    //   });

    cluster(root);

    g.selectAll('.link')  // links
      .data(root.descendants().slice(1))
      .enter().append('path')
      .attr('class', styles.link)
      .attr('d', function (d) {

        return `M${project(d.x, d.y)}C${project(d.x, (d.y + d.parent.y) / 2)} ${project(d.parent.x, (d.y + d.parent.y) / 2)} ${project(d.parent.x, d.parent.y)}`;
      });

    const node = g.selectAll('.node')
      .data(root.descendants())
      .enter().append('g')
      .attr('class', function (d) {

        return `${styles.node} ${d.children ? styles.nodeInternal : styles.nodeLeaf}`;
      })
      .attr('transform', function (d) {

        return `translate(${project(d.x, d.y)})`;
      });

    node.append('circle')
      .attr('r', 4);

    node.append('text')
      .attr('dy', '0.31em')
      .attr('x', function (d) {
        return d.x < 180 === !d.children ? 6 : -6;
      })
      .style('text-anchor', function (d) {
        return d.x < 180 === !d.children ? 'start' : 'end';
      })
      .attr('transform', function (d) {

        return `rotate(${d.x < 180 ? d.x - 90 : d.x + 90})`;
      })
      .text(function (d) {
        return d.id.substring(d.id.lastIndexOf('.') + 1); // d.data.name;
      });

    node.append('text')
      .attr('class', styles.linkValue)
      .attr('dy', '0.31em')
      .attr('x', function (d) {
        return d.x < 180 === !d.children ? -6 : 6;
      })
      .style('text-anchor', function (d) {
        return d.x < 180 === !d.children ? 'end' : 'start';
      })
      .attr('transform', function (d) {
        return `rotate(${d.x < 180 ? d.x - 90 : d.x + 90})`;
      })
      .text('value=5.0');
  }

  render() {
    const {dom, width, height} = this.props;
    const params = {dom, width, height};

    d3.csv('RadialDendrogram.csv', function (error, data) {
      if (error) {
        throw error;
      }
      // console.log('data', data);
      RadialDendrogram.draw(data, params);
    });
  }

}