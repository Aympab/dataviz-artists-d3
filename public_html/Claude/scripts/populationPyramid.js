/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global d3 */

/*************************************Initialisation wasabi******************************************************/
var data = [];
var rawJson = [];
var artistTypeList = ["Person", "Group", "Unknow"];
var newGenreList = [];
var racinesGenres = ["soul", "indie", "rock", "gospel", "christian", "r&b", "country"
            , "jazz", "hip-hop", "blues", "house", "classical"];
var legendTitle=["Solo","Groupe"];
var legendColors=["#B0C4DE"," 	#F08080"];
var dateComparaison=null;
var titreStr="hole";


d3.json("JSON/data.json", function (jsonFile) {
    // sauvegarde du JSON initial
    rawJson = jsonFile;
    draw();
});

/**
 * Appel à la mise à jour des boutons
 */
d3.select("#addGenre")
        .on("click", updateGenre);

d3.select("#addAnne")
        .on("click", updateAnnee);

d3.select("#clearDate")
        .on("click", clearAnnee);
d3.select("#clearGenre")
        .on("click", clearGenre);

function updateGenre() {
    var genre = d3.select("#racine-txt").property("value");
    if(genre!=""){
        genre = genre.toLowerCase();
        addArtistGenreRacine(genre);
        newGenreList.push(genre);
        draw();  
    }
}

function updateAnnee() {
    var date = d3.select("#annee").property("value");
    if(date!="" || date!=null ){
         dateComparaison=date; 
         draw();
     }
    
}

function clearAnnee() {
    var clear = d3.select("#clearDate").property("checked");
    if(clear){
        dateComparaison=null; 
     draw();
    }
    
}

function clearGenre() {
    deleteNewGenre();
     draw();
    
}




/***************************************D3 JS********************************************************/

// SET UP DIMENSIONS
var w = 800,
        h = 600;

// margin.middle is distance from center line to each y-axis
var margin = {
    top: 20,
    right: 20,
    bottom: 24,
    left: 20,
    middle: 35
};

// the width of each side of the chart
var regionWidth = w / 2 - margin.middle;

// these are the x-coordinates of the y-axes
var pointA = regionWidth,
        pointB = w - regionWidth;



/**
 * Dessin du graphe
 * @returns {undefined}
 */

function draw() {
    // charge data
    configure(rawJson);
   
    d3.selectAll("svg").remove();
    
    // CREATE SVG
var svg = d3.select('#chart').append('svg')
        .attr('width', margin.left + w + margin.right)
        .attr('height', margin.top + h + margin.bottom)
        // ADD A GROUP FOR THE SPACE WITHIN THE MARGINS
        .append('g')
        .attr('transform', translation(margin.left, margin.top));

// find the maximum data value on either side
//  since this will be shared by both of the x-axes
    var maxValue = Math.max(
            d3.max(data, function (d) {
                return d.person;
            }),
            d3.max(data, function (d) {
                return d.group;
            })
            );

    var maxValuePerson = d3.max(data, function (d) {
        return d.person;
    });

// SET UP SCALES

// the xScale goes from 0 to the width of a region
//  it will be reversed for the left x-axis
    var xScale = d3.scale.log()
            .domain([1, maxValue])
            .rangeRound([0, regionWidth])
            .nice();

    var xScaleLeft = d3.scale.log()
            .domain([1, maxValue])
            .rangeRound([regionWidth, 0]);

    var xScaleRight = d3.scale.log()
            .domain([1, maxValue])
            .rangeRound([0, regionWidth]);

    var yScale = d3.scale.ordinal()
            .domain(data.map(function (d) {
                return d.genre;
            }))
            .rangeRoundBands([h, 0], 0.1);

// definir domaine dans drow
// faire le scale avec le range avant

// SET UP AXES
    var yAxisLeft = d3.svg.axis()
            .scale(yScale)
            .orient('right')
            .tickSize(4, 0)
            .tickPadding(margin.middle - 4);

    var yAxisRight = d3.svg.axis()
            .scale(yScale)
            .orient('left')
            .tickSize(4, 0)
            .tickFormat('');

    var xAxisRight = d3.svg.axis()
            .scale(xScale)
            .orient('bottom');

    var xAxisLeft = d3.svg.axis()
            // REVERSE THE X-AXIS SCALE ON THE LEFT SIDE BY REVERSING THE RANGE
            .scale(xScale.copy().range([pointA, 0]))
            .orient('bottom');

// MAKE GROUPS FOR EACH SIDE OF CHART
// scale(-1,1) is used to reverse the left side so the bars grow left instead of right
    var leftBarGroup = svg.append('g')
            .attr('transform', translation(pointA, 0) + 'scale(-1,1)');
    var rightBarGroup = svg.append('g')
            .attr('transform', translation(pointB, 0));

    // DRAW AXES
    svg.append('g')
            .attr('class', 'axis y left')
            .attr('transform', translation(pointA, 0))
            .call(yAxisLeft)
            .selectAll('text')
            .style('text-anchor', 'middle');

    svg.append('g')
            .attr('class', 'axis y right')
            .attr('transform', translation(pointB, 0))
            .call(yAxisRight);

        
    // DRAW BARS
    var gLeft = leftBarGroup.selectAll('.bar.left')
            .data(data)
            .enter()
            .append('g')
            .attr('class', 'g left');

    gLeft.append('rect') 
            .attr('class', 'bar left')
            .attr('x', 0)
            .attr('y', function (d) {
                return yScale(d.genre);
            })
            .attr('width', function (d) {
                return xScale(d.person);
            })
            .attr('height', yScale.rangeBand()) ;

    gLeft.append("text")
            .text(function (d) {
                return d.person
            })
            .attr("text-anchor", "end")
            .attr("fill", "white")
            .attr("dy", "0.30em")
            .attr('x', function (d) {
                return xScale(maxValuePerson) - (0.55 * xScale(d.person));
            })
            .attr('y', function (d) {
                return yScale(d.genre) + yScale.rangeBand() / 2;
            }).attr('transform', translation(pointA, 0) + 'scale(-1,1)');

    var gRight = rightBarGroup.selectAll('.bar.right')
            .data(data)
            .enter()
            .append('g')
            .attr('class', 'g right');

    gRight.append('rect')
            .attr('class', 'bar right')
            .attr('x', 0)
            .attr('y', function (d) {
                return yScale(d.genre);
            }).attr('width', function (d) {
        return xScale(d.group);
    })
            .attr('height', yScale.rangeBand())
            ;
  

    gRight.append("text")
            .text(function (d) {
                return d.group;
            })
            .attr("text-anchor", "end")
            .attr("fill", "white")
            .attr("dy", "0.30em")
            .attr('x', function (d) {
                return xScale(d.group) - 4;
            })
            .attr('y', function (d) {

                return yScale(d.genre) + yScale.rangeBand() / 2;
            });



    // Tooltips
    var tooltip = d3.select("body").append("div")
            .attr("class", "tooltip");

    leftBarGroup.selectAll('.bar.left')
            .data(data)
            .on("mouseover", function (d) {
                tooltip.html("<strong> " + d.genre + " unknow</strong> <span style='color:red'>" + d.unknow + "</span>")
                        .style("visibility", "visible");
            })
            .on("mousemove", function (d) {
                tooltip.style("top", event.pageY - (tooltip[0][0].clientHeight + 5) + "px")
                        .style("left", event.pageX - (tooltip[0][0].clientWidth / 2.0) + "px");
            })
            .on("mouseout", function (d) {
                tooltip.style("visibility", "hidden");
            });

    rightBarGroup.selectAll('.bar.right')
            .data(data)
            .on("mouseover", function (d) {
                tooltip.html("<strong> " + d.genre + " unknow:</strong> <span style='color:red'>" + d.unknow + "</span>")
                        .style("visibility", "visible");
            })
            .on("mousemove", function (d) {
                tooltip.style("top", event.pageY - (tooltip[0][0].clientHeight + 5) + "px")
                        .style("left", event.pageX - (tooltip[0][0].clientWidth / 2.0) + "px");
            })
            .on("mouseout", function (d) {
                tooltip.style("visibility", "hidden");
            });
            
    // legend
     var legend = svg.selectAll(".legend")
        .data(legendTitle)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("x", w)
        .attr("width", 18)
        .attr("height", 18)
        .attr('fill', function(d, i){
            return legendColors[i];
        });
        

    legend.append("text")
        .attr("x", w)
        .attr("y", 9)
        .attr("dy", ".35em")
        .attr("fill","dark")
        .style("text-anchor", "end")
        .text(function(d) { return d; });

// mise à jour de la valeur du texte 
updateTitreValue();

}

function translation(x,y) {
  return 'translate(' + x + ',' + y + ')';
}

function updateTitreValue() {
    if(dateComparaison!=null){
        document.getElementById("titreStr").innerHTML = "depuis " + dateComparaison;
    }else{
         document.getElementById("titreStr").innerHTML = "";
    }
    
 }


/*********************************Chargement des donneées*****************************************/
/**
 *  Fonction pour configurer les données 
 * @param {array} dataJson les données brut
 * @param {int} year la période sur laquelle on veut comparer
 * @returns {array} les donnnées mises en forme
 */
function configure(dataJson) {
    data=[];
    dataJson = getArtistWithDeezerFan(dataJson);
   
    if(dateComparaison != null ){
       dataJson = getArtistFromDate(dataJson);
    }
  
    
    dataJson.forEach(function (artist) {
        var artistGenres = JSON.parse(artist.genres);
        var artistType = formaterType(artist.type);
       
        artistGenres.forEach(function (artistGenre) {
            artistGenre = isGenreExist(artistGenre);
            if (artistGenre != null) {
                var indexGenreExistant = getGenreLine(artistGenre);
                if (indexGenreExistant == null) {
                    // création des lignes dans le tableau : 3 clés  person, group, unknow
                    creerGenre(artistGenre);
                }
                indexGenreExistant = getGenreLine(artistGenre);
                // ajout du nombre de fan deezer
                addDeezerFans(indexGenreExistant, artistType, parseInt(artist.deezerFans));
            }
        });
    });
}

/**
 * Ajout du nombre de fan deezer 
 * @param {type} indexGenreExistant
 * @param {type} artistType
 * @param {type} deezerFans
 * @returns {undefined}
 */
function addDeezerFans(indexGenreExistant, artistType, deezerFans) {
    switch (artistType) {
        case 'Person':
            data[indexGenreExistant].person += deezerFans;
            break;
        case 'Group':
            data[indexGenreExistant].group += deezerFans;
            break;
        case 'Unknow':
            data[indexGenreExistant].unknow += deezerFans;
            break;

    }
}

/**
 * Fonction pour rechercher si le genre existe
 *  en parametre existe dans data
 * @param {type} genre 
 * @returns {boolean} existance 
 */
function isGenreExist(genre) {
    var result = null;
    var index = racinesGenres.indexOf(genre.toLowerCase());
    if (index != -1) {
        result = racinesGenres[index];

    }
    return result;
}

/**
 * Fonction pour rechercher la ligne du genre dans data
 * @param {string} genre 
 * @param {string} type 
 * @returns {object} l'objet JSON
 */
function getGenreLine(genre) {
    var result = null;

    data.forEach(function (line, index) {
        if (line.genre === genre) {
            result = index;
        }

    })
    return result;
}

/**
 * Formate l'attribut type de artiste
 * Il y a 3 types d'artistes: person, group ou unkown
 * @param {string} type
 * @returns {undefined}
 */
function formaterType(type) {
    var result = type;
    if (type == "") {
        result = "Unknow";
    }
    return result;
}


/**
 *  Ne garde que les lignes avec les attributs "genres" et "deezerFans"
 * @param {JSON} dataJSON
 * @returns {array} result
 */
function getArtistWithDeezerFan(dataJSON) {
    var result = dataJSON.filter(function (artist) {
        var filter = false;
        if ((!artist.deezerFans == "" || !artist.deezerFans == undefined) && (artist.genres != "[]" || artist.genres != "Unknow")) {
            filter = true;
        }
        return filter;
    });
    return result;
}

/**
 *  Ne garde que les artiste de l'ère voulu ( la date de debut de l'artiste >= dateVoulue)
 * @param {JSON} dataJSON
 * @returns {array} result
 */
function getArtistFromDate(dataJSON) {
    var result = dataJSON.filter(function (artist) {
        var filter = false;
        var lifeSpan = artist.lifeSpan.begin;
        
        var lifeSpanTab = lifeSpan.split("-");
        var annee = parseInt(lifeSpanTab[0]);
        
        if ( ( artist.lifeSpan.begin == "") || ( annee>= dateComparaison )) {
            filter = true;
        }
        return filter;
    });
    return result;
}


/**
 * Enregistrement du genre pour les 3 types d'artiste Personne,Groupe, Inconnu
 * @param {type} artistGenre
 * @returns {undefined}
 */
function creerGenre(artistGenre) {
    var line = {};
    line.genre = artistGenre;
    line.group = 0;
    line.person = 0;
    line.unknow = 0;
    data.push(line);
}



/**
 * AJoute dans la liste des genre 
 * @param {type} genre
 * @returns {void}
 */
function addArtistGenreRacine(genre) {
    if (racinesGenres.indexOf(genre) == -1) {
        racinesGenres.push(genre);
    }

}

function deleteNewGenre(){
    newGenreList.forEach(function(genre,index){
        var indexRacine = racinesGenres.indexOf(genre);
        if(indexRacine!=-1){
          racinesGenres.splice(indexRacine,1);
          newGenreList.splice(index,1);
        }
    });
}






