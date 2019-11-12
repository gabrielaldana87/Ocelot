const filterTimeRange = function (key, data, a, b, completion) {
  if (a.getTime() === b.getTime()) return;
  let points = crossfilter(data),
    interval = points.dimension(function (d, i) {
      return new Date(d[key]).getTime();
    }),
    filter = interval.filterRange([a.getTime(), b.getTime()]);
  return filter;
  //return completion(null, filter);
};

const largestTriangleThreeBucket = function (data, threshold, xProperty, yProperty) {
  /**
   * This method is adapted from the
   * "Largest Triangle Three Bucket" algorithm by Sveinn Steinarsson
   * In his 2013 Masters Thesis - "Downsampling Time Series for Visual Representation"
   * http://skemman.is/handle/1946/15343
   *
   * The MIT License
   *
   * Copyright (c) 2013 by Sveinn Steinarsson
   *
   * Permission is hereby granted, free of charge, to any person obtaining a copy
   * of this software and associated documentation files (the "Software"), to deal
   * in the Software without restriction, including without limitation the rights
   * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   * copies of the Software, and to permit persons to whom the Software is
   * furnished to do so, subject to the following conditions:
   * The above copyright notice and this permission notice shall be included in
   * all copies or substantial portions of the Software.
   * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
   * THE SOFTWARE.
   * --------------------------------------------------------------------------------------------------------
   */
  yProperty = yProperty || 0;
  xProperty = xProperty || 1;

  var m = Math.floor,
    y = Math.abs,
    f = data.length;

  if (threshold >= f || 0 === threshold) {
    return data;
  }

  var n = [],
    t = 0,
    p = (f - 2) / (threshold - 2),
    c = 0,
    v,
    u,
    w;

  n[t++] = data[c];

  for (var e = 0; e < threshold - 2; e++) {
    for (var g = 0, h = 0, a = m((e + 1) * p) + 1, d = m((e + 2) * p) + 1, d = d < f ? d : f, k = d - a; a < d; a++) {
      g += +data[a][xProperty], h += +data[a][yProperty];
    }

    for (var g = g / k, h = h / k, a = m((e + 0) * p) + 1, d = m((e + 1) * p) + 1, k = +data[c][xProperty], x = +data[c][yProperty], c = -1; a < d; a++) {
      "undefined" != typeof data[a] && (u = .5 * y((k - g) * (data[a][yProperty] - x) - (k - data[a][xProperty]) * (h - x)), u > c && (c = u, v = data[a], w = a));
    }

    n[t++] = v;
    c = w;
  }

  n[t++] = data[f - 1];

  return n;
};