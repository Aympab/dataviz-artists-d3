/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

//Dimensions
var margin, width, height;

//Objet html
var svg;

//Axes 
var x,y;
var genreFinal = ["Rock","Hip Hop","Jazz","Pop","Blues","House","Techno","Folk"];
var years = ["1940-1950","1950-1960","1960-1970","1970-1980","1980-1990","1990-2000","2000-2010","2010-2020"];

//Utils
    //Couleur du graph 
    var myColor;  
    
    //Condition liste déroulante
    var selection = "All";
    
    //Tooltip
    var tooltip;

//Extraction et construction des données
var myMap = new Map();
var myJson = '[';
var json;

//Initialisation
d3.json("json/donnees.json").then(function(data) { 
    buildSvg(data);
    buildHeatMap(data);
    buildTooltip();
    //configure(data);
});  
 
//Lorsque la liste déroulante change
function onOptionSelected() {
    selection = document.getElementById("type-select").value;
    d3.json("json/donnees.json").then(function(data){
        buildHeatMap(data);
    });
}
   
//Construire la heatMap
function buildHeatMap(data) {
    
    var map = svg.selectAll(".map").data(data, function(d) {return d.gender +':'+ d.year;});

    map.exit()
        .transition()
        .duration(1000)
        .attr("width", 0)
        .remove();
    
    map.enter()
      .append("rect")
      .attr("class", "map")
      .attr("x", function(d) { return x(d.gender) })
      .attr("y", function(d) { return y(d.year) })
      .attr("width", x.bandwidth() )
      .attr("height", y.bandwidth() )
      .merge(map).transition()
      .duration(1000)
      .style("fill", function(d) {return myColor(calculValue(d))});
        
    svg.selectAll("rect")
            .on("mouseover",function() {
                tooltip.style("opacity", 1)
            })
            .on("mousemove",function(d) {
                tooltip
                  .html("Nombre d'artiste :  "+ calculValue(d))
                  .style("left", (d3.event.pageX + 10) + "px")
                  .style("top", (d3.event.pageY) + "px")
            })
            .on("mouseout",function() {
                tooltip.style("opacity", 0)   
            });
    
    buildLegend(data);
        
}

function buildSvg(data) {
    // Initialiser les dimensions du graph 
    margin = {top: 20, right: 100, bottom: 100, left: 100};
    width = 850 - margin.left - margin.right,
    height = 450 - margin.top - margin.bottom;


    //  Lier l'objet à la page 
    svg = d3.select("#my_map")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform","translate(" + margin.left + "," + margin.top + ")");



    // Construire l'axe des abscisses 
    x = d3.scaleBand()
    .range([ 0, width ])
    .domain(genreFinal)
    .padding(0.01);
    svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))


    // Construire l'axe des ordonnées 
    y = d3.scaleBand()
    .range([ height, 0 ])
    .domain(years)
    .padding(0.01);
    svg.append("g")
    .call(d3.axisLeft(y));

    // Choisir les couleurs
    myColor = d3.scaleLinear()
    .range(["#8195F1", "#f0b454"])
    .domain([0, d3.max(data,function(d) {return d.total;})]);

}

function buildTooltip(){
    tooltip = d3.select("#my_map")
                .append("div")
                .attr("class", "tooltip")
                .style("opacity", 1)
                .style("background-color", "white")
                .style("color", "black")
                .style("border", "thick double #5b70cf")
                .style("border-radius", "5px")
                .style("padding", "5px")
                .style("position","absolute");
}

function buildLegend(data) {
    
    var countScale = d3.scaleLinear()
    .domain([0, d3.max(data, function(d) {return d.total; })])
    .range([0, width])
    
    numStops = 3;
    countPoint = [0, d3.max(data, function(d) {return d.total; }) / 2, d3.max(data, function(d) {return d.total; })];

    svg.append("defs")
    .append("linearGradient")
    .attr("id", "legend-traffic")
    .attr("x1", "0%").attr("y1", "0%")
    .attr("x2", "100%").attr("y2", "0%")
    .selectAll("stop") 
    .data(d3.range(numStops))                
    .enter().append("stop") 
        .attr("offset", function(d,i) { 
            return countScale(countPoint[i]) / width;
        })   
        .attr("stop-color", function(d,i) { 
            return myColor(countPoint[i]); 
        });

    var legendWidth = Math.min(width * 0.8, 400);

    var legendsvg = svg.append("g") 
        .attr("class", "legendWrapper")
        .attr("transform", "translate(" + (width/2) + "," + (height + 60) + ")");

    legendsvg.append("rect") 
        .attr("class", "legendRect")
        .attr("x", -legendWidth/2)
        .attr("y", 0)
        .attr("width", legendWidth)
        .attr("height", 10)
        .style("fill", "url(#legend-traffic)");

    var xScale = d3.scaleLinear() 
         .range([-legendWidth / 2, legendWidth / 2])
         .domain([ 0, d3.max(data, function(d) { return d.total; })] );

    legendsvg.append("g") // x axis
        .attr("class", "axis")
        .attr("transform", "translate(0," + (10) + ")")
        .call(d3.axisBottom(xScale).ticks(5));
}

function calculValue(d){
    if(selection === "All") {
        return d.total;
    }else if (selection === "Person") {
        return d.total - d.nbGroup;
    } else if (selection === "Group") {
        return d.total - d.nbPerson;
    } 
}

//A partir d'ici les fonctions ont été utilisées pour extraire et construire le fichier donnees.json
function configure(data) {
    data.forEach(function(d){
        var arrayGenres = splitTextArray(d.genres);

        if (typeof arrayGenres !== undefined && arrayGenres.length > 1 ) {
            if (arrayGenres[0] !== "") {
                for (var i=0; i<arrayGenres.length; i++) {
                    var currentGenre = arrayGenres[i];
                    var key = newTypeOfGenre(currentGenre);

                    if(genreFinal.includes(currentGenre) &&  key !== null) {
                        var yearData = myMap.get(key);
                        var keyYear = getYearFromBegin(d.lifeSpan.begin);
                        if (keyYear !== undefined) {
                            if (yearData !== undefined) {
                                var currentCount = yearData.get(keyYear);
                                if (currentCount !== undefined ) {
                                    yearData.set(keyYear,addCount(currentCount,d.type));
                                } else {
                                    var count = createCountObject();
                                    yearData.set(keyYear,addCount(count,d.type));
                                }
                            } else {
                                yearData = new Map();
                                var count = createCountObject();
                                yearData.set(keyYear,addCount(count,d.type));
                            }
                        }
                        myMap.set(key,yearData);
                    }
                }
            }
        }   
    });
    //console.log(myMap);
    myMap = completeYear(myMap);
    var keys = Array.from(myMap.keys());
    var i = 0;
    myMap.forEach(function(d){
        var mapIterator = Array.from(d.keys());
        var j = 0;
        d.forEach(function(d2){
            var year = mapIterator[j];
            var nbPerson = d2.nbPerson;
            var nbGroup = d2.nbGroup;
            
            if(nbPerson === undefined){
                nbPerson = 0;
            }
            
            if(nbGroup === undefined){
                nbGroup = 0;
            }
            json = '{"gender":"' + keys[i] + '","year": "' + year + '" ,"total":' + d2.total +' ,"nbPerson":' + nbPerson + ' ,"nbGroup":' + nbGroup + '}';
            myJson = myJson + json + ',';
          j = j+1;
        });
        i = i+1;
    });
    myJson = myJson.substring(0,myJson.length-1);
    myJson = myJson + ']';
    console.log(myJson);
    //heatMap(JSON.parse(myJson));
}

function addCount(data,type) {
    if (type === "Person") {
        data.nbPerson = data.nbPerson + 1;
    } else if (type === "Group") {
        data.nbGroup = data.nbGroup + 1;
    } 
    data.total = data.total+1;
    return data;
}

function createCountObject () {
    var data = new Object();
    data.nbPerson = 0;
    data.nbGroup = 0;
    data.total = 0;
    return data;
}

//Permet de découper array de string en un tableau
function splitTextArray(textArray) {
    //Si on a que 2 caractères le tableau est vide
    if (textArray.length < 2) {
        return null
    }
 
    textArray = textArray.replaceAll('\[', "")
    textArray = textArray.replaceAll('\]', "")
 
    textArray = textArray.replaceAll('"', "")
    if (!textArray.includes(",")) {
        textArray = [textArray]
        // array.push(textAray);     
    }
    else {
        textArray = textArray.split(",")
    }
 
    return textArray;
}

function newTypeOfGenre(genre){
    if (genre.includes("Punk")) {
        return "Punk"; 
    } else if (genre.includes("Hip Hop")) {
        return "Hip Hop";
    } else if (genre.includes("Rap")) {
        return "Rap";
    } else if (genre.includes("Rock")) {
        return "Rock";
    } else if (genre.includes("Jazz")) {
        return "Jazz";
    } else if (genre.includes("Metal")) {
        return "Metal";
    } else if (genre.includes("Pop")) {
        return "Pop";
    } else if (genre.includes("House")) {
        return "House";
    } else if (genre.includes("Blues")) {
        return "Blues";
    } else if (genre.includes("Techno")) {
        return "Techno";
    } else if (genre.includes("Folk")) {
        return "Folk";
    } else {
        null;
    }
}

function getYearFromBegin(begin){
    var year = begin.substring(0,3);
    if (year === "194") {
        return "1940-1950";
    } else if(year === "195") {
        return "1950-1960";
    } else if(year === "196"){
        return "1960-1970";
    } else if(year === "197"){
        return "1970-1980";
    } else if(year === "198"){
        return "1980-1990"; 
    } else if(year === "199"){
        return "1990-2000"; 
    } else if(year === "200"){
        return "2000-2010"; 
    } else if(year === "201"){
        return "2010-2020"; 
    } 
}

function completeYear(map) {
    var keys = Array.from(map.keys());
    var i = 0;
    map.forEach(function(d) {
        var array = Array.from(d.keys());
        var length = array.length;
        var key = keys[i];
        yearData = map.get(key);
        var count = createCountObject();
        if (length < 8){
            if(!array.includes("1940-1950")) {
                yearData.set("1940-1950",count);
            }
            if(!array.includes("1950-1960")) {
                yearData.set("1950-1960",count);
            }
            if(!array.includes("1960-1970")) {
                yearData.set("1960-1970",count);
            }
            if(!array.includes("1970-1980")) {
                yearData.set("1970-1980",count);
            }
            if(!array.includes("1980-1990")) {
                yearData.set("1980-1990",count);
            }
            if(!array.includes("1990-2000")) {
                yearData.set("1990-2000",count);
            }
            if(!array.includes("2000-2010")) {
                yearData.set("2000-2010",count);
            }
            if(!array.includes("2010-2020")) {
                yearData.set("2010-2020",count);
            }
            map.set(key,yearData);
        } 
        i = i+1;
    });
    return map;
}



