export const math = (arr2 = [1, 0, 0], arr1 = [0, 0, 1]) => {
  const {x1, y1, z1} = {x1: arr1[0], y1: arr1[1], z1: arr1[2]};
  const {x2, y2, z2} = {x2: arr2[0], y2: arr2[1], z2: arr2[2]};
  return [y1 * z2 - z1 * y2, z1 * x2 - x1 * z2, x1 * y2 - y1 * x2];
};
export const rotates = (theta0, xiangl) => {
  const theta = theta0 * Math.PI / 180;
  const newarr = [];
  const sqrt = Math.sqrt(xiangl[0] * xiangl[0] + xiangl[1] * xiangl[1] + xiangl[2] * xiangl[2]);
  const {u, v, w} = {u: xiangl[0] / sqrt, v: xiangl[1] / sqrt, w: xiangl[2] / sqrt};
  newarr[0] = Math.cos(theta) + (u * u) * (1 - Math.cos(theta));
  newarr[1] = u * v * (1 - Math.cos(theta)) + w * Math.sin(theta);
  newarr[2] = u * w * (1 - Math.cos(theta)) - v * Math.sin(theta);
  newarr[3] = 0;
  newarr[4] = u * v * (1 - Math.cos(theta)) - w * Math.sin(theta);
  newarr[5] = Math.cos(theta) + v * v * (1 - Math.cos(theta));
  newarr[6] = w * v * (1 - Math.cos(theta)) + u * Math.sin(theta);
  newarr[7] = 0;
  newarr[8] = u * w * (1 - Math.cos(theta)) + v * Math.sin(theta);
  newarr[9] = v * w * (1 - Math.cos(theta)) - u * Math.sin(theta);
  newarr[10] = Math.cos(theta) + w * w * (1 - Math.cos(theta));
  newarr[11] = 0;
  newarr[12] = 0;
  newarr[13] = 0;
  newarr[14] = 0;
  newarr[15] = 1;
  return newarr;
};

export const location = (data_length, middle_index, deep) => {
  const arry = middle_index;
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
};

export const all_angles = (data, deep) => {
  const length = deep;
  let num = 0;
  let Sn = 1;
  const angles = [{
    theta: 0,
    phi: 0,
    text: data[0].name
  }];
  const loop = (Sn, n) => {
    let an = 2 * n - 1;
    if (n > length / 2 + 1) {
      const number = length - n + 2;
      an = 2 * number - 1;
    }
    data.forEach((elem, i) => {
      const obj = {};
      if (i !== 0) {
        if (i >= Sn && i < (Sn + an)) {
          obj.theta = Math.PI / length * (n - 1);
          obj.phi = 2 * Math.PI / an * num;
          obj.text = elem.name;
          num += 1;
          angles.push(obj);
        }
      }
    });
  };
  for (let n = 2; n <= deep + 1; n += 1) {
    loop(Sn, n);
    let number = n;
    if (n > length / 2 + 1) {
      number = length - n + 2;
    }
    Sn = Sn + 2 * number - 1;
  }
  return angles;
};

export const scaleLabel = (currentDeep) => {
  let w = 120;
  let h = 60;

  if (currentDeep === 20) {
    w = 100;
    h = 50;
  }

  if (currentDeep === 14) {
    w = 130;
    h = 65;
  }

  if (currentDeep === 8 || currentDeep === 10) {
    w = 140;
    h = 70;
  }

  if (currentDeep === 6 || currentDeep === 2) {
    w = 160;
    h = 80;
  }

  return {w, h};
};