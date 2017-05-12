import * as _ from 'lodash';
import * as styles from './WordCloude3D.scss';
import * as d3 from 'd3';
import {math, rotates, all_angles, scaleLabel} from './WordCloud3D.server';

/**
 * @options
 *  - dom       <Element>(*) a HTML Element
 *  - data      <Object>(*)  json
 *  - deep      <Number>(*)  the half_deep of ball
 *  - dropDownArray   <Array>  the dropDown data
 *  - radius    <Number>     the radius of the ball you want to show.default: 300
 *
 * @methods
 *  - render() render the histogram
 *
 * @examples
 * var wordCloud3D = new WordCloud3D({
 *   dom: document.getElementById('id'),
 *   data: {...},
 *   radius: 300,
 * });
 *
 * wordCloud3D.render();
 */

export class WordCloude3D {
  constructor(options) {
    this.props = {};
    if (!options ||
      typeof options.dom === 'undefined' ||
      typeof options.data === 'undefined') {
      throw Error('dom and data must be set');
    }
    _.assign(this.props, {
      radius: 300,
      deep: 0,
      dropDownArray: [],
      theta: 0,
      middle_index: []
    }, options);
  }

  innit() {
    let data = [];
    // this.props.deep = Math.floor(Math.sqrt(2 * this.props.data.length - 1) - 1);
    if (this.props.deep % 2 !== 0) {
      this.props.deep -= 1;
    }
    const length = this.props.deep * this.props.deep / 2 + this.props.deep + 1;
    if (length >= 5) {
      _.times(length, (i) => {
        data.push(this.props.data[i]);
      });
      data.sort(() => {
        const n = Math.random() > 0.5 ? -1 : 1;
        return n;
      });
    } else {
      data = this.props.data;
    }
    return data;
  }

  render() {
    const data = this.innit();
    const container = document.createElement('div');
    container.className = styles.container;
    const out = document.createElement('div');
    out.className = styles.out;
    const ul = document.createElement('ul');
    ul.className = styles.balls;
    d3.select(this.props.dom).selectAll('*').remove();
    this.props.dom.appendChild(container);
    container.appendChild(out);
    out.appendChild(ul);
    const width = this.props.width || this.props.dom.clientWidth;
    const height = this.props.height || this.props.dom.clientHeight;
    if (this.props.radius > _.min([width, height]) / 2) {
      this.props.radius = _.min([width, height]) / 2;
    }

    if (this.props.deep === 2) {
      this.props.radius = 100;
    }
    const result = this.draw(data, this.props.radius, {w: width, h: height});
    for (const elem of result[0]) {
      ul.appendChild(elem);
    }
    let move = setInterval(() => this.moves(ul, 2, math()), 120);
    let {current, label_w, label_h, label_text} = {current: 'none', label_w: 0, label_h: 0, label_text: ''};
    container.addEventListener('click', (e) => {
      clearInterval(move);
      this.props.theta = 0;
      if (!_.isString(current)) {
        current.style.backgroundColor = '#30b9fb';
        current.style.width = label_w;
        current.style.height = label_h;
        current.style.lineHeight = label_h;
        current.textContent = label_text;
      }
      out.style.transform = 'translateZ(-300px)';
      out.style.transition = 'transform 1s ease';
      const ev = e || window.event;
      const x3 = ev.clientX - container.offsetLeft - width / 2;
      const y3 = ev.clientY - container.offsetTop - height / 2;
      move = window.setInterval(() => this.moves(ul, 2, math([x3, y3, 0])), 100);
    }, true);
    const rotate = this.less_locate(data.length, result[1]);
    _.times(data.length, (i) => {
      const label = ul.querySelector(`#label${i}`);
      label.onclick = () => {
        clearInterval(move);
        const l = rotate[i];
        if (!_.isString(current)) {
          current.style.backgroundColor = '#30b9fb';
          current.style.width = label_w;
          current.style.height = label_h;
          current.style.lineHeight = label_h;
          current.textContent = label_text;
        }
        label_w = label.style.width;
        label_h = label.style.height;
        label_text = label.textContent;
        if (label.title !== '') {
          label.textContent = data[i].name;
          label.style.width = 'auto';
          label.style.height = '35px';
          label.style.lineHeight = '35px';
        }
        label.style.backgroundColor = '#03a3c7';
        out.style.transform = 'translateZ(-60px)';
        ul.style.transform = `rotateX(${l.x}deg) rotateY(${l.y}deg)`;
        ul.style.transition = 'transform 1s ease-in-out';
        out.style.transition = 'transform 1s ease-in-out';
        current = label;
      };
    });
  }

  draw(data, r, {w, h}) {
    const {angles, frequency} = this.computing(data);
    const element = [];
    const middle_index = [];
    angles.forEach((elem, i) => {
      let length = frequency[i].width / 7;
      if (elem.text.search(/[^\u4E00-\u9FA5]/g)) {
        length = frequency[i].width / 16;
      }
      const z = r * Math.sin(elem.theta) * Math.cos(elem.phi);
      let x = r * Math.sin(elem.theta) * Math.sin(elem.phi) + w / 2;
      const y = r * Math.cos(elem.theta) + h / 2 - frequency[i].height / 2;
      const li = document.createElement('li');
      if (Math.abs(_.round(x) - w / 2) < 5) {
        middle_index.push(i);
      }
      li.setAttribute('id', `label${i}`);
      if (elem.text.length > length) {
        li.textContent = _.truncate(elem.text, {length, 'omission': '..'});
        li.title = 'click';
      } else {
        li.textContent = elem.text;
      }
      if (data.length < 5) {
        x += frequency[i].width / 2;
      }
      li.style.cssText = `left: ${x}px;top: ${y}px; width:${frequency[i].width}px;height:${frequency[i].height}px;line-height:${frequency[i].height}px`;
      const d = elem.theta - Math.PI / 2;
      li.style.transform = `translateZ(${z}px) rotateY(${elem.phi}rad) rotateX(${d}rad)`;
      element.push(li);
    });
    return [element, middle_index];
  }

  moves(balls, step1, xiang) {
    this.props.theta += step1;
    const arr = rotates(this.props.theta, xiang);
    balls.style.transform = `matrix3d(${arr[0]},${arr[1]},${arr[2]},${arr[3]},${arr[4]},${arr[5]},
     ${arr[6]},${arr[7]},${arr[8]},${arr[9]},${arr[10]},${arr[11]},${arr[12]},${arr[13]},${arr[14]},${arr[15]})`;
  }

  less_locate(length, result) {
    if (length < 5) {
      const rotate = [];
      _.times(length, (i) => {
        const rotate_y = 360 / length * (1 - i);
        rotate.push({
          x: 0,
          y: rotate_y
        });
      });
      return rotate;
    } else {
      return this.locate(length, result, this.props.deep);
    }
  }

  computing(data) {
    const less = () => {
      if (data.length < 5) {
        const less = [];
        data.forEach((elem, i) => {
          const obj = {};
          obj.theta = Math.PI / 2;
          obj.phi = 2 * Math.PI / data.length * (i - 1);
          obj.text = elem.name;
          less.push(obj);
        });
        return less;
      } else {
        return all_angles(data, this.props.deep);
      }
    };
    const frequency = () => {
      let min_range = 0.4;
      const dropDownLength = this.props.dropDownArray.length;
      if (dropDownLength > 0) {
        const scale_deep = d3.scaleLinear()
          .domain([6, this.props.dropDownArray[dropDownLength - 1].deep])
          .range([0.3, 0.6]);

        min_range = 1 - _.round(scale_deep(this.props.deep), 2);
      }
      // console.log("deep: min: ", this.props.deep, min_range);
      const {w, h} = scaleLabel(this.props.deep);
      const frequency = [];
      const min = _.minBy(data, (elem) => {
        const num = +elem.num;
        return num;
      }).num;
      const max = _.maxBy(data, (elem) => {
        const num = +elem.num;
        return num;
      }).num;

      const scale = d3.scaleLinear()
        .domain([min, max])
        .range([min_range, 1]);
      if (min === max) {
        _.times(data.length, () => {
          frequency.push({
            width: 80,
            height: 30
          });
        });
      } else {
        for (const elem of data) {
          const c = _.round(scale(elem.num), 2);
          frequency.push({
            width: c * w,
            height: c > 0.32 ? c * h : 16
          });
        }
      }
      return frequency;
    };
    return {angles: less(), frequency: frequency()};
  }

  locate(data_length, result, deep) {
    const arry = result;
    const length = deep;
    const rotate = [{
      x: 90,
      y: 0
    }];
    let Sn = 1;

    const loop = (Sn, n, elem) => {
      let an = 2 * n - 1;
      if (n > length / 2 + 1) {
        const number = length - n + 2;
        an = 2 * number - 1;
      }
      for (let i = 0; i < data_length; i++) {
        if (i >= Sn && i < (Sn + an)) {
          const index = elem - i;
          const deep = length - n + 1;
          const rotate_x = 180 / length * (deep - length / 2);
          const rotate_y = index * 360 / an;
          rotate.push({
            x: rotate_x,
            y: rotate_y
          });
        }
      }

    };
    for (let n = 2; n <= length + 1; n += 1) {
      loop(Sn, n, arry[n - 1]);
      let number = n;
      if (n > length / 2 + 1) {
        number = length - n + 2;
      }
      Sn = Sn + 2 * number - 1;
    }
    return rotate;
  }
}