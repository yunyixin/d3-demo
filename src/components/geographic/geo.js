const geographic = function (element, data, customObject) {
    // console.log('地图数据', data.features);
    var width = customObject.width;
    var height = customObject.height;

    var color = d3.scale.category20c();
    var svg = d3.select(element).append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(0,0)");

    var projection = d3.geo.mercator()
        .center(customObject.center)
        .scale(customObject.scaleNumber)
        .translate([width / 2, height / 2]);

    var path = d3.geo.path()
        .projection(projection);

    var blocks = svg.selectAll("path")
        .data(data.features)
        .enter()
        .append("path")
        .attr("stroke", "#000")
        .attr("stroke-width", 1)
        .attr("fill", function (d, i) {
            return "blue";
        })
        .attr("d", path)   //return path(d)
        .on("mouseover", function (d, i) {
            d3.select(this)
                .attr("fill", "yellow");
        })
        .on("mouseout", function (d, i) {
            d3.select(this)
                .attr("fill", color(i));
        });

    svg.selectAll("text")
        .data(data.features)
        .enter()
        .append("text")
        .attr("transform", function (d, i) {
            // console.log('d', path.centroid(d));
            var x = path.centroid(d)[0] - 20;
            var y = path.centroid(d)[1];
            switch (d.properties.name) {
                //for china
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
            return "translate(" + x + "," + y + ")";
        })
        .text(function (d) {
            return d.properties.name;
        })
        .attr("font-size", 12);

    d3.json("range.json", function (error, dataset) {

        // for color
        var linear = d3.scale.linear()
            .domain([0, 2500])
            .range([0, 1]);
        var gradientColor = d3.interpolateRgb(d3.rgb(255, 0, 0), d3.rgb(255, 255, 0)); // 红 黄
        var formatData = function (dataArray) {
            dataArray.forEach(function (d) {
                console.log(d);
            })
        };

        blocks.style("fill", function (d, i) {
            var value = 0;
            dataset.results.forEach(function (ele) {
                if (ele.province === d.properties.name) {
                    value = ele.value;
                }
            });
            return gradientColor(linear(value));
        })
            //.on("mouseover", function (d, i) {
            //    d3.select(this)
            //        .attr("fill", "blue");
            //})
            //.on("mouseout", function (d, i) {
            //    d3.select(this)
            //        .attr("fill", color(i));
            //});
    })
};