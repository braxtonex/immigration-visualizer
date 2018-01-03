//import * as d3 from 'd3';
import {} from './Visualizer.js';
import * as d3 from 'd3';
import * as d3sc from 'd3-scale-chromatic';

let dataFlags;
export let allCombined;

export let genNotes = {
  'lprNote': 'Immigrant data not shown for those with unknown country of birth and for countries where total immigrant population in a given year was less than 10.',
  'niNote': 'Data not shown for those with unknown or nonexistent country of citizenship and for countries where total immigrant population in currently selected year was less than 10.',
  'dwNote': 'dw = Data withheld to limit disclosure.',
}

export function csvHandler(csvData, lprni) {
  if (lprni === 'LPR') {
    csvData.forEach(function(d) {
      d.immediateRelative = +d.immediateRelative;
      d.familySponsored = +d.familySponsored;
      d.employmentBased = +d.employmentBased;
      d.refugeeAsylee = +d.refugeeAsylee;
      d.diversityLottery = +d.diversityLottery;
      d.adoptedOrphans = +d.adoptedOrphans;
      d.otherLPR = +d.otherLPR;
      d.total = +d.total;
    });
  }
  if (lprni === 'NI') {
    csvData.forEach(function(d) {
      d.temporaryVisitor = +d.temporaryVisitor;
      d.studentExchange = +d.studentExchange;
      d.temporaryWorker = +d.temporaryWorker;
      d.diplomatRep = +d.diplomatRep;
      d.otherNI = +d.otherNI;
      d.total = +d.total;
    });
  }
}


export function handleMouseover(d, i) {     //BUG1: the first time a country is moused over, it displays the correct data, but then after that it will display that same data no matter which state it changes to. each country does this and behavior independent
  if (d.immigrationData === undefined) {
    console.log('no immigration data for current year')
  } else {
    //title on hover (temporary)
    /*d3.select(this)
      .append('svg:title')
      .attr('class',function() {return 'path '+d.id})
      .attr('dy','.35em')
      .text(newData.find(item => item.id === d.id).immigrationData.countryName+': '+newData.find(item => item.id === d.id).immigrationData.total.toLocaleString())*/
    //see country data on mouseover
    var selCountry = allCombined.find(item => item.id === d.id).immigrationData;
    console.log(selCountry.countryName+": "+selCountry.selectedTotal.toLocaleString())
  }
}

export function handleMouseout() {
}

export function combinator(world, dataset, flags) {
  dataFlags = dataset.map(data => ({...data, href: flags.find(flag => flag[0] === data.ISO)[2]  }))
  allCombined = world.features.map(f => ({
    type: 'Feature',
    id: f.properties.iso_a3,
    name: f.properties.name_long,
    formalName: f.properties.formal_en,
    population: f.properties.pop_est,
    geometry: f.geometry,
    immigrationData: dataFlags.find(dataFlag => dataFlag.ISO === f.properties.iso_a3)
  })
)/*.filter(x => x.immigrationData !== undefined)*/
  .sort((a,b) => {
    if (a.name <b.name) return -1;
    if (a.name > b.name) return 1;
    return 0;
  })
}

  export function fillChoropleth(d,rdState,sumSelected) {
    if (d.immigrationData === undefined) {
      return '#dddddd'
    } else {
      //console.log(d);
      if (rdState === 'LPR') {
        let lprColor = d3.scaleQuantile()
          .domain([-0.01,0,0.125,0.25,.5,1,2.5,5,10,15])
          .range(d3sc.schemePuBuGn[9].slice(1));
        return lprColor((d.immigrationData.selectedTotal/sumSelected)*100)
      }
        else if (rdState === 'NI') {
          let niColor = d3.scaleQuantile()
          //.domain([0,allCombined.immigrationData.total.reduce(function(a,b) => Math.max(a,b))])
            .domain([-0.01,0,0.025,0.25,.5,1,2.5,5,10,15,25])
            .range(d3sc.schemeYlGnBu[9].slice(1));
          return niColor((d.immigrationData.selectedTotal/sumSelected)*100)
      }
    }
  }

  export function goFill(g, geoPath,rdState,sumSelected) {
    g.selectAll('path')
    //g.append('path')  //topo try^
      .data(allCombined)
      //.datum(topojson.feature(worldMap,worldMap.objects.ne_110m_admin_0_countries.geometries)) //topo try^
      .enter()
      .append('path')
      //.attr('fill', function(d) {return color(fillChoropleth(d))})
      .attr('fill', function(d) {return fillChoropleth(d,rdState,sumSelected)})
      .attr('stroke','#333').attr('stroke-width','.015')
      .attr('d',geoPath)
      //for adding
      .on('mouseover', handleMouseover)
      .on('mouseout', handleMouseout);
  }
