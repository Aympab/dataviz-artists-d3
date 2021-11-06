/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/* global d3, runningData*/
var chartInnerDiv = '<div class="innerCont" style="overflow: auto;top:0px; left: 400px; height:91% ; Width:100% ;position: relative;overflow: hidden;"/>';
var truncLengh = 30;

//Sous titre de base
var soustitre = "Pour tous les genres";
$("#" + "soustitre").empty();
$("#" + "soustitre").append(soustitre);

$(document).ready(function () {
    Plot();
});

function Plot() {
    d3.json("./genresUrl.json",function(data){
    var chartData = getData(data);
    TransformChartData(chartData, chartOptions, 0);
    BuildPie("chart", chartData, chartOptions, 0);
});}

function BuildPie(id, chartData, options, level) {
    var xVarName;
    var divisionRatio = 2.5;
    var legendoffset = (level === 0) ? 0 : -40;

    d3.selectAll("#" + id + " .innerCont").remove();
    $("#" + id).append(chartInnerDiv);
    chart = d3.select("#" + id + " .innerCont");

    var yVarName = options[0].yaxis;
    width = $(chart[0]).outerWidth(),
            height = $(chart[0]).outerHeight(),
            radius = Math.min(width, height) / divisionRatio;

    if (level === 1) {
        xVarName = options[0].xaxisl1;
    } else {
        xVarName = options[0].xaxis;
    }

    var rcolor = d3.scale.ordinal().range(runningColors);
    
    arc = d3.svg.arc()
            .outerRadius(radius)
            .innerRadius(radius - 200);

    var arcOver = d3.svg.arc().outerRadius(radius + 20).innerRadius(radius - 180);

    chart = chart
            .append("svg")  //append svg element inside #chart
            .attr("width", width)    //set width
            .attr("height", height)  //set height
            .append("g")
            .attr("transform", "translate(" + (width / divisionRatio) + "," + ((height / divisionRatio) + 30) + ")");

    var pie = d3.layout.pie()
            .sort(null)
            .value(function (d) {
                return d.value;
            });

    var g = chart.selectAll(".arc")
            .data(pie(runningData))
            .enter().append("g")
            .attr("class", "arc");

    var count = 0;

    var path = g.append("path")
            .attr("d", arc)
            .attr("id", function (d) {
                return "arc-" + (count++);
            })
            .style("opacity", function (d) {
                return d.data["op"];
            });

    path.on("mouseenter", function (d) {
        d3.select(this)
                .attr("stroke", "white")
                .transition()
                .duration(200)
                .attr("d", arcOver)
                .attr("stroke-width", 1);
    })
            .on("mouseleave", function (d) {
                d3.select(this).transition()
                        .duration(200)
                        .attr("d", arc)
                        .attr("stroke", "none");
            })
            .on("click", function (d) {
                if (this._listenToEvents) {
                    // Reset inmediatelly
                    d3.select(this).attr("transform", "translate(0,0)");
                    // Change level on click if no transition has started
                    path.each(function () {
                        this._listenToEvents = false;
                    });
                }
                d3.selectAll("#" + id + " svg").remove();
                if (level === 1) {
                    //Sous titre général
                    soustitre="Pour tous les genres";
                    $("#" + "soustitre").empty();
                    $("#" + "soustitre").append(soustitre);
                    TransformChartData(chartData, options, 0, d.data[xVarName]);
                    BuildPie(id, chartData, options, 0);
                } else {
                    var nonSortedChart = chartData.sort(function (a, b) {
                        return parseFloat(b[options[0].yaxis]) - parseFloat(a[options[0].yaxis]);
                    });
                    
                    //Sous titre pour les urls
                    soustitre="Pour le genre " + d.data[xVarName] + " : répartition des url";
                    $("#" + "soustitre").empty();
                    $("#" + "soustitre").append(soustitre);
                    TransformChartData(nonSortedChart, options, 1, d.data[xVarName]);
                    BuildPie(id, nonSortedChart, options, 1);
                }

            });

    path.append("svg:title")
            .text(function (d) {
                return d.data["title"] + " (" + d.data[yVarName] + ")";
            });

    path.style("fill", function (d) {
        return rcolor(d.data[xVarName]);
    })
            .transition().duration(1000).attrTween("d", tweenIn).each("end", function () {
        this._listenToEvents = true;
    });


    g.append("text")
            .attr("transform", function (d) {
                return "translate(" + arc.centroid(d) + ")";
            })
            .attr("dy", ".35em")
            .style("text-anchor", "middle")
            .style("opacity", 1)
            .text(function (d) {
                return d.data[yVarName];
            });

    count = 0;
    var legend = chart.selectAll(".legend")
            .data(runningData).enter()
            .append("g").attr("class", "legend")
            .attr("legend-id", function (d) {
                return count++;
            })
            .attr("transform", function (d, i) {
                return "translate(15," + (parseInt("-" + (runningData.length * 10)) + i * 28 + legendoffset) + ")";
            })
            .style("cursor", "pointer")
            .on("click", function () {
                var oarc = d3.select("#" + id + " #arc-" + $(this).attr("legend-id"));
                oarc.style("opacity", 0.3)
                        .attr("stroke", "white")
                        .transition()
                        .duration(200)
                        .attr("d", arcOver)
                        .attr("stroke-width", 1);
                setTimeout(function () {
                    oarc.style("opacity", function (d) {
                        return d.data["op"];
                    })
                            .attr("d", arc)
                            .transition()
                            .duration(200)
                            .attr("stroke", "none");
                }, 1000); 
            });

    var leg = legend.append("rect");

    leg.attr("x", width / 2)
            .attr("width", 18).attr("height", 18)
            .style("fill", function (d) {
                return rcolor(d[yVarName]);
            })
            .style("opacity", function (d) {
                return d["op"];
            });
    legend.append("text").attr("x", (width / 2) - 5)
            .attr("y", 9).attr("dy", ".35em")
            .style("text-anchor", "end").text(function (d) {
        return d.caption;
    });

    leg.append("svg:title")
            .text(function (d) {
                return d["title"] + " (" + d[yVarName] + ")";
            });

    function tweenOut(data) {
        data.startAngle = data.endAngle = (2 * Math.PI);
        var interpolation = d3.interpolate(this._current, data);
        this._current = interpolation(0);
        return function (t) {
            return arc(interpolation(t));
        };
    }

    function tweenIn(data) {
        var interpolation = d3.interpolate({startAngle: 0, endAngle: 0}, data);
        this._current = interpolation(0);
        return function (t) {
            return arc(interpolation(t));
        };
    }

}

function TransformChartData(chartData, opts, level, filter) {
    var result = [];
    var resultColors = [];
    var counter = 0;
    var hasMatch;
    var xVarName;
    var yVarName = opts[0].yaxis;
    
    if (level === 1) {
        
        xVarName = opts[0].xaxisl1;

        for (var i in chartData) {
            hasMatch = false;
            for (var index = 0; index < result.length; ++index) {
                var data = result[index];

                if ((data[xVarName] === chartData[i][xVarName]) && (chartData[i][opts[0].xaxis]) === filter) {
                    result[index][yVarName] = result[index][yVarName] + chartData[i][yVarName];
                    hasMatch = true;
                    break;
                }

            }
            if ((hasMatch === false) && ((chartData[i][opts[0].xaxis]) === filter)) {
                if (result.length < 9) {
                    ditem = {};
                    ditem[xVarName] = chartData[i][xVarName];
                    ditem[yVarName] = chartData[i][yVarName];
                    ditem["caption"] = chartData[i][xVarName];
                    ditem["title"] = chartData[i][xVarName];
                    ditem["op"] = 1.0 - parseFloat("0." + (result.length));
                    result.push(ditem);

                    resultColors[counter] = opts[0].color[0][chartData[i][opts[0].xaxis]];

                    counter += 1;
                    soustitre = opts[0].captions + "";
                }
            }
        }
    } else {
        xVarName = opts[0].xaxis;
        
        for (var i in chartData) {
            hasMatch = false;
            for (var index = 0; index < result.length; ++index) {
                var data = result[index];

                if (data[xVarName] === chartData[i][xVarName]) {
                    result[index][yVarName] = result[index][yVarName] + chartData[i][yVarName];
                    hasMatch = true;
                    break;
                }
            }
            if (hasMatch === false) {
                ditem = {};
                ditem[xVarName] = chartData[i][xVarName];
                ditem[yVarName] = chartData[i][yVarName];
                ditem["caption"] = opts[0].captions !== undefined ? opts[0].captions[0][chartData[i][xVarName]] : "";
                ditem["title"] = opts[0].captions !== undefined ? opts[0].captions[0][chartData[i][xVarName]] : "";
                ditem["op"] = 1;
                result.push(ditem);

                resultColors[counter] = opts[0].color !== undefined ? opts[0].color[0][chartData[i][xVarName]] : "";

                counter += 1;
            }
        }
    }
    runningData = result;
    runningColors = resultColors;
    return;
}

chartOptions = [{
        "captions": [{"Soul": "Soul", "Rock": "Rock", "Pop": "Pop", "HipHop": "HipHop", "Blues": "Blues", "Electronic": "Electronic", "Folk": "Folk", "R&B": "R&B", "Jazz": "Jazz", "Country": "Country", "Grunge": "Grunge"}],
        "color": [{"Soul": "#D8C4F5", "Rock": "#A9FAFB", "Pop": "#FFEB9A", "HipHop": "#7DCEA0", "Blues": "#FAB3A0", "Electronic": "#BB8FCE", "Folk": "#FF90BC", "R&B": "#90FF98", "Jazz": "#90B1FF", "Country": "#68F4E2", "Grunge": "#F38740"}],
        "xaxis": "genre",
        "xaxisl1": "url",
        "yaxis": "value"
    }];

function getData(data) {
    var deezerSoul = 0,deezerRock = 0,deezerPop = 0,deezerHip = 0,deezerBlues = 0,
        deezerElectronic = 0,deezerFolk = 0,deezerRB = 0,deezerJazz = 0,deezerCountry = 0,
        deezerGrunge = 0;
    var spotSoul = 0,spotRock = 0,spotPop = 0,spotHip = 0,spotBlues = 0,
        spotElectronic = 0,spotFolk = 0,spotRB = 0,spotJazz = 0,spotCountry = 0,
        spotGrunge = 0;
    var soundSoul = 0,soundRock = 0,soundPop = 0,soundHip = 0,soundBlues = 0,
        soundElectronic = 0,soundFolk = 0,soundRB = 0,soundJazz = 0,soundCountry = 0,
        soundGrunge = 0;
    data.forEach(function (d) {
        if (d.genres.includes('Soul')) {
            if (d.urlSoundCloud!==""){ soundSoul = soundSoul+1; }
            if (d.urlSpotify!==""){ spotSoul = spotSoul+1; }
            if (d.urlDeezer!==""){ deezerSoul = deezerSoul+1; }
        }else if (d.genres.includes('Rock')) {
            if (d.urlSoundCloud!==""){ soundRock = soundRock+1; }
            if (d.urlSpotify!==""){ spotRock = spotRock+1; }
            if (d.urlDeezer!==""){ deezerRock = deezerRock+1; }
        }else if (d.genres.includes('Pop')) {
            if (d.urlSoundCloud!==""){ soundPop = soundPop+1; }
            if (d.urlSpotify!==""){ spotPop = spotPop+1; }
            if (d.urlDeezer!==""){ deezerPop = deezerPop+1; }
        }else if (d.genres.includes('Hip Hop')) {
            if (d.urlSoundCloud!==""){ soundHip = soundHip+1; }
            if (d.urlSpotify!==""){ spotHip = spotHip+1; }
            if (d.urlDeezer!==""){ deezerHip = deezerHip+1; }
        }else if (d.genres.includes('Blues')) {
            if (d.urlSoundCloud!==""){ soundBlues = soundBlues+1; }
            if (d.urlSpotify!==""){ spotBlues = spotBlues+1; }
            if (d.urlDeezer!==""){ deezerBlues = deezerBlues+1; }
        }else if (d.genres.includes('Electronic')) {
            if (d.urlSoundCloud!==""){ soundElectronic = soundElectronic+1; }
            if (d.urlSpotify!==""){ spotElectronic = spotElectronic+1; }
            if (d.urlDeezer!==""){ deezerElectronic = deezerElectronic+1; }
        }else if (d.genres.includes('Folk')) {
            if (d.urlSoundCloud!==""){ soundFolk = soundFolk+1; }
            if (d.urlSpotify!==""){ spotFolk = spotFolk+1; }
            if (d.urlDeezer!==""){ deezerFolk = deezerFolk+1; }
        }else if (d.genres.includes('R&B')) {
            if (d.urlSoundCloud!==""){ soundRB = soundRB+1; }
            if (d.urlSpotify!==""){ spotRB = spotRB+1; }
            if (d.urlDeezer!==""){ deezerRB = deezerRB+1; }
        }else if (d.genres.includes('Jazz')) {
            if (d.urlSoundCloud!==""){ soundJazz = soundJazz+1; }
            if (d.urlSpotify!==""){ spotJazz = spotJazz+1; }
            if (d.urlDeezer!==""){ deezerJazz = deezerJazz+1; }
        }else if (d.genres.includes('Country')) {
            if (d.urlSoundCloud!==""){ soundCountry = soundCountry+1; }
            if (d.urlSpotify!==""){ spotCountry = spotCountry+1; }
            if (d.urlDeezer!==""){ deezerCountry = deezerCountry+1; }
        }else if (d.genres.includes('Grunge')) {
            if (d.urlSoundCloud!==""){ soundGrunge = soundGrunge+1; }
            if (d.urlSpotify!==""){ spotGrunge = spotGrunge+1; }
            if (d.urlDeezer!==""){ deezerGrunge = deezerGrunge+1; }
        }
    });
    var counts = [{"genre":"Soul","url":"urlSoundCloud","value":soundSoul},
                  {"genre":"Soul","url":"urlSpotify","value":spotSoul},
                  {"genre":"Soul","url":"urlDeezer","value":deezerSoul},
                  {"genre":"Rock","url":"urlSoundCloud","value":soundRock},
                  {"genre":"Rock","url":"urlSpotify","value":spotRock},
                  {"genre":"Rock","url":"urlDeezer","value":deezerRock},
                  {"genre":"Pop","url":"urlSoundCloud","value":soundPop},
                  {"genre":"Pop","url":"urlSpotify","value":spotPop},
                  {"genre":"Pop","url":"urlDeezer","value":deezerPop},
                  {"genre":"HipHop","url":"urlSoundCloud","value":soundPop},
                  {"genre":"HipHop","url":"urlSpotify","value":spotHip},
                  {"genre":"HipHop","url":"urlDeezer","value":deezerHip},
                  {"genre":"Blues","url":"urlSoundCloud","value":soundBlues},
                  {"genre":"Blues","url":"urlSpotify","value":spotBlues},
                  {"genre":"Blues","url":"urlDeezer","value":deezerBlues},
                  {"genre":"Electronic","url":"urlSoundCloud","value":soundElectronic},
                  {"genre":"Electronic","url":"urlSpotify","value":spotElectronic},
                  {"genre":"Electronic","url":"urlDeezer","value":deezerElectronic},
                  {"genre":"Folk","url":"urlSoundCloud","value":soundFolk},
                  {"genre":"Folk","url":"urlSpotify","value":spotFolk},
                  {"genre":"Folk","url":"urlDeezer","value":deezerFolk},
                  {"genre":"R&B","url":"urlSoundCloud","value":soundRB},
                  {"genre":"R&B","url":"urlSpotify","value":spotRB},
                  {"genre":"R&B","url":"urlDeezer","value":deezerRB},
                  {"genre":"Jazz","url":"urlSoundCloud","value":soundJazz},
                  {"genre":"Jazz","url":"urlSpotify","value":spotJazz},
                  {"genre":"Jazz","url":"urlDeezer","value":deezerJazz},
                  {"genre":"Country","url":"urlSoundCloud","value":soundCountry},
                  {"genre":"Country","url":"urlSpotify","value":spotCountry},
                  {"genre":"Country","url":"urlDeezer","value":deezerCountry},
                  {"genre":"Grunge","url":"urlSoundCloud","value":soundGrunge},
                  {"genre":"Grunge","url":"urlSpotify","value":spotGrunge},
                  {"genre":"Grunge","url":"urlDeezer","value":deezerGrunge}];

    return counts;
}
