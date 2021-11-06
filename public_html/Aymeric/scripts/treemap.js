//Constantes
const width = 600
const height = (width / 2)
const delta = width * 0.02

//Variables utiles
var flag = false
var data = ""
var tabContinent = ""
var tabGenres = ["blues", "electro", "folk", "hiphop", "indus", "jazz", "metal", "pop", "reg", "rock", "popRock"];

getData().then(
    function (allData) {

        tabContinent = groupByContinent(wasabiData)

        const hashMapAsie = tabContinent[0]
        const hashMapNA = tabContinent[1]
        const hashMapSA = tabContinent[2]
        const hashMapEU = tabContinent[3]
        const hashMapOCE = tabContinent[4]
        const hashMapAfr = tabContinent[5]

        const asie = decouperEnObjet(hashMapAsie, 'Asie')
        const na = decouperEnObjet(hashMapNA, 'Amérique du nord')
        const sa = decouperEnObjet(hashMapSA, 'Amérique du sud')
        const eu = decouperEnObjet(hashMapEU, 'Europe')
        const oc = decouperEnObjet(hashMapOCE, 'Océanie')
        const af = decouperEnObjet(hashMapAfr, "Afrique")


        const tab = [asie, eu, af, oc, na, sa]
        data = {
            name: "World",
            children: tab
        }

        console.log(data);
        tml2(data)
        console.log("OK")


    })


//Treemap layout
function tml2(data) {
    //Gestion des couleurs
    //#region Couleurs
    var color = d3.scaleOrdinal().domain(tabGenres)
        .range(["#3949AB", "#8E24AA", "#FFB300", "#F4511E", "#6D4C41", "#FDD835", "#e53935", "#1E88E5", "#43A047", "#5E35B1", "#FB8C00"])


    var trouverBonneCouleur = function (d) {
        var objFind = genreInfo.find(element => element.loc == d.data.name)

        if (objFind != undefined) {
            switch (objFind.genre) {
                case "blues": return color(0);
                case "electro": return color(1);
                case "folk": return color(2);
                case "hiphop": return color(3);
                case "indus": return color(4);
                case "jazz": return color(5);
                case "metal": return color(6);
                case "pop": return color(7);
                case "reg": return color(8);
                case "rock": return color(9);
                case "popRock": return color(10);
            }
        }
        if (d.children == undefined) {
            return "#78909C"
        }
        else {
            return "#78909C"

        }
    }

    var leg = d3.select("#leg").select("svg").attr("width", 550)//.attr("heigth", 20);

    var cx = 10;
    var xx = cx + 15

    // Handmade legend
    leg.append("circle").attr("cx", cx).attr("cy", 10).attr("r", 10).style("fill", color(0))
    leg.append("text").attr("x", xx).attr("y", 15).text("Blues").style("font-size", "15px")

    cx += 80;
    xx = cx + 15;

    leg.append("circle").attr("cx", cx).attr("cy", 10).attr("r", 10).style("fill", color(1))
    leg.append("text").attr("x", xx).attr("y", 15).text("Electro").style("font-size", "15px")

    cx += 80;
    xx = cx + 15;

    leg.append("circle").attr("cx", cx).attr("cy", 10).attr("r", 10).style("fill", color(2))
    leg.append("text").attr("x", xx).attr("y", 15).text("Folk").style("font-size", "15px")

    cx += 60;
    xx = cx + 15;

    leg.append("circle").attr("cx", cx).attr("cy", 10).attr("r", 10).style("fill", color(3))
    leg.append("text").attr("x", xx).attr("y", 15).text("Hip hop").style("font-size", "15px")

    cx += 80;
    xx = cx + 15;

    leg.append("circle").attr("cx", cx).attr("cy", 10).attr("r", 10).style("fill", color(4))
    leg.append("text").attr("x", xx).attr("y", 15).text("Industrial").style("font-size", "15px")

    cx += 95;
    xx = cx + 15;

    leg.append("circle").attr("cx", cx).attr("cy", 10).attr("r", 10).style("fill", color(5))
    leg.append("text").attr("x", xx).attr("y", 15).text("Jazz").style("font-size", "15px")


    //ligne suivante
    cx = 10;
    xx = cx + 15

    leg.append("circle").attr("cx", cx).attr("cy", 60).attr("r", 10).style("fill", color(8))
    leg.append("text").attr("x", xx).attr("y", 65).text("Reggae").style("font-size", "15px")

    cx += 80;
    xx = cx + 15;

    leg.append("circle").attr("cx", cx).attr("cy", 60).attr("r", 10).style("fill", color(9))
    leg.append("text").attr("x", xx).attr("y", 65).text("Rock").style("font-size", "15px")

    cx += 80;
    xx = cx + 15;

    leg.append("circle").attr("cx", cx).attr("cy", 60).attr("r", 10).style("fill", color(10))
    leg.append("text").attr("x", xx).attr("y", 65).text("Pop-Rock").style("font-size", "15px")

    cx += 105;
    xx = cx + 15;

    leg.append("circle").attr("cx", cx).attr("cy", 60).attr("r", 10).style("fill", color(6))
    leg.append("text").attr("x", xx).attr("y", 65).text("Metal").style("font-size", "15px")

    cx += 80;
    xx = cx + 15;

    leg.append("circle").attr("cx", cx).attr("cy", 60).attr("r", 10).style("fill", color(7))
    leg.append("text").attr("x", xx).attr("y", 65).text("Pop").style("font-size", "15px")

    //#endregion 

    //#region init treemap

    //Création de la treemap
    var format = d3.format(",d")
    var f = d3.format(".3r");

    var name = d => d.ancestors().reverse().map(d => d.data.name).join("/")


    //Création de la hiérarchie treepmap
    function tile(node, x0, y0, x1, y1) {
        d3.treemapBinary(node, 0, 0, width, height);
        for (const child of node.children) {
            child.x0 = x0 + child.x0 / width * (x1 - x0);
            child.x1 = x0 + child.x1 / width * (x1 - x0);
            child.y0 = y0 + child.y0 / height * (y1 - y0);
            child.y1 = y0 + child.y1 / height * (y1 - y0);
        }
    }

    var treemap = data => d3.treemap(data)
        .tile(tile)
        (d3.hierarchy(data)
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value))


    const x = d3.scaleLinear().rangeRound([0, width]);
    const y = d3.scaleLinear().rangeRound([0, height]);

    const svg = d3.select("#chart")
        .select("svg")
        .attr("width", width * 1.5)
        .attr("height", height * 1.5)
        .attr("viewBox", [0, -delta, width + 30, height + delta])
        .style("font", "4px sans-serif");

    let group = svg.append("g")
        .call(render, treemap(data));
    //#endregion


    function render(group, root) {
        const node = group
            .selectAll("g")
            .data(root.children.concat(root))
            .join("g")

        node.filter(d => d === root ? d.parent : d.children)
            .attr("cursor", "pointer")
            .on("click", (event, d) => d === root ? zoomout(root) : zoomin(d));


        node.append("rect")
            .attr("id", d => d === root ? "root" : null)
            .attr("fill", function (d) {
                if (d == root) {
                    return "#fff"
                }
                else {
                    return trouverBonneCouleur(d)
                }
            })
            .style("fill-opacity", d => d === root ? 1.0 : d.children ? 1.0 : 0.42)
            .attr("stroke-width", 0.2)
            .attr("stroke", d => d === root ? "#fff" : d.children ? "black" : "black")


        node.append("text")
            .selectAll("tspan")
            .data(function (d) {
                if (d == root) {
                    return name(d).split("/ ").concat(format(d.value))
                }
                else {
                    var tab = [d.data.name]
                    tab.push(format(d.value))
                    return tab
                }
            })
            .join("tspan")
            // .attr("align", "center")
            .attr("x", 1)
            .attr("y", (d, i, node) => `${(i === node.length - 1) * 0.3 + 1.1 + i * 0.9}em`)
            .attr("fill-opacity", (d, i, node) => i === node.length - 1 ? 0.7 : null)
            .attr("font-weight", (d, i, node) => i === node.length - 1 ? "normal" : null)
            .text(d => d)


        node
            .on("mouseover", function (event, d) {
                if (d != root) {
                    d3.select(this)
                        .style("font-weight", "bold")
                        .style("font-size", "7px")
                }
            })
            .on("mousemove", function (event, d) {


                var xPosition = event.pageX + 5;
                var yPosition = event.pageY + 5;

                d3.select("#tooltip")
                    .style("left", xPosition + "px")
                    .style("top", yPosition + "px");
                d3.select("#tooltip #heading")
                    .text("" + d.data.name);
                d3.select("#tooltip #percentage")
                  .text(f(d.value/root.value*100) + "%")
                d3.select("#tooltip #value")
                  .text(format(d.value));
                d3.select("#tooltip").classed("hidden", false);
            })
            //  (event, d) => d === root ? mouseover : null)
            .on("mouseleave", function (event, d) {
                if (d != root) {
                    d3.select(this)
                        .style("font-weight", "normal")
                        .style("font-size", "4px")
                }

                d3.select("#tooltip").classed("hidden", true);
            })
        // (event, d) => d === root ? null : mouseleave)


        group.call(position, root);
    }

    function position(group, root) {
        group.selectAll("g")
            .attr("transform", d => d === root ? `translate(0,-${delta})` : `translate(${x(d.x0)},${y(d.y0)})`)
            .select("rect")
            .attr("width", d => d === root ? width : x(d.x1) - x(d.x0))
            .attr("height", d => d === root ? delta : y(d.y1) - y(d.y0));
    }

    // When zooming in, draw the new nodes on top, and fade them in.
    function zoomin(d) {
        const group0 = group.attr("pointer-events", "none");
        const group1 = group = svg.append("g").call(render, d);

        x.domain([d.x0, d.x1]);
        y.domain([d.y0, d.y1]);


        svg.transition()
            .duration(750)
            .call(t => group0.transition(t).remove()
                .call(position, d.parent))
            .call(t => group1.transition(t)
                .attrTween("opacity", () => d3.interpolate(0, 1))
                .call(position, d));
    }

    // When zooming out, draw the old nodes on top, and fade them out.
    function zoomout(d) {
        const group0 = group.attr("pointer-events", "none");
        const group1 = group = svg.insert("g", "*").call(render, d.parent);

        x.domain([d.parent.x0, d.parent.x1]);
        y.domain([d.parent.y0, d.parent.y1]);

        svg.transition()
            .duration(750)
            .call(t => group0.transition(t).remove()
                .attrTween("opacity", () => d3.interpolate(1, 0))
                .call(position, d))
            .call(t => group1.transition(t)
                .call(position, d.parent));
    }

    // render(group, root)
    return svg.enter()
}


