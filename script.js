const mapDisplay=document.querySelector('#mapPart');
const chartDisplay=document.querySelector('#chartPart');
const circleContainer=document.querySelector('.circle-container');
const detailsOverlay=document.querySelector('#detailsOverlay');
const detailsContainer=document.querySelector('.detailsTab');
const detailsCloser=document.querySelector('#detailsClose');
const yearSelector=document.querySelector('#years');
const yearCounter=document.querySelector('.year-counter');
const chartSelector=document.querySelector('#chartSelector');
const chartXSize = 800;
const chartYSize = 500;
const chartMargin = 40;
const chartXMax = chartXSize - chartMargin*2;
const chartYMax = chartYSize - chartMargin*2;
const svg = d3.select("#myPlot").append("svg")
  .append("g")
  .attr("transform","translate(" + chartMargin + "," + chartMargin + ")")
  .attr("class","chartHolder")
  ;
var data =[];
var chartData=[];
async function getData(){
    await fetch('./converted.json')
    .then((response) => response.json())
    .then((json) => data=json)
    fillMap();
    afterFetchInit();
}

function fillMap(){
    data.forEach(element => {
        addToMap(element);
    });
}
function addToMap(reportJson){
    let newCircle= document.createElementNS("http://www.w3.org/2000/svg",'svg');
    newCircle.classList.add("svg-circle");
    newCircle.setAttribute('width', '6');
    newCircle.setAttribute('height', '6');
    newCircle.style.position='absolute';
    newCircle.style.top=(49-reportJson.latitude)/24*631;
    newCircle.style.left=(reportJson.longitude+125)/58*1167;
    newCircle.innerHTML=`
        <circle cx="3" cy="3" r="3" fill="red" />
    `;
    circleContainer.appendChild(newCircle);
    newCircle.addEventListener('click',()=>setDetails(reportJson));
}
function setDetails(reportJson){
    detailsOverlay.style.display="block";
    detailsContainer.innerHTML=`
        <p>Report Details:</p>
        <p>Title: ${reportJson.title}</p> 
        <p>Location: ${reportJson.location_details}</p>
        <p>Date: ${reportJson.date}</p>
        <p>Classfication: ${reportJson.classification}</p>
        <p>Weather: ${reportJson.summary}</p> 
        <p>Statement: ${reportJson.observed}</p>
    `;
}
function hideDetails(){
    detailsOverlay.style.display="none";
}
function reloadMap(year){
    circleContainer.innerHTML='';
    let count=0;
    for(let i=0;i<data.length;i++){
        if(data[i].date.includes(year)){
            addToMap(data[i]);
            count++;
        }
    }
    yearCounter.innerHTML=count;

}
function populateOptions(min,max){
    for (let i = min; i<=max; i++){
        var option = document.createElement('option');
        option.value = i.toString();
        option.innerHTML = i;
        yearSelector.appendChild(option);
    }
}
function showChartValue(element){
  let container=document.getElementsByClassName("dotValueContainer")[0];
  container.style.display="block";
  container.firstChild.innerHTML=`
    <tspan x="0" dy="1.2em">Year:${element[0]}</tspan>
    <tspan x="0" dy="1.2em">Count:${element[1]}</tspan>
  `;
}
function hideChartValue(){
  let container=document.getElementsByClassName("dotValueContainer")[0];
  container.style.display="none";
}

function setChartData(chartType){
    if(chartType==="1"){
        let seasonData=data.map((element) => element.season);
        let seasonCounts={};
        seasonData.forEach((season) => {
          if (seasonCounts[season]) {
            seasonCounts[season]++;
          } 
          else {
            seasonCounts[season] = 1;
          }
        });
        chartData=Object.entries(seasonCounts);
        toSeasonChart();
    }
    else if(chartType==="2"){
        let classificationData=data.map((element) => element.classification);
        let classificationCounts={};
        classificationData.forEach((classification) => {
          if (classificationCounts[classification]) {
            classificationCounts[classification]++;
          } 
          else {
            classificationCounts[classification] = 1;
          }
        });
        chartData=Object.entries(classificationCounts);
        toClassificationChart();
    }
    else if(chartType==="3"){
        let weatherData=data.map((element) => element.summary);
        let weatherCounts={};
        weatherData.forEach((weather) => {
          if (weatherCounts[weather]) {
            weatherCounts[weather]++;
          } 
          else {
            weatherCounts[weather] = 1;
          }
        });
        chartData=Object.entries(weatherCounts);
        toWeatherChart();
    }
    else if(chartType==="4"){
        let yearData=data.map((element) => element.date);
        let yearCounts={};
        yearData.forEach((date) => {
          let modDate=date.substring(0,4);
          if (yearCounts[modDate]) {
            yearCounts[modDate]++;
          } 
          else {
            yearCounts[modDate] = 1;
          }
        });
        chartData=Object.entries(yearCounts);
        toYearChart();
    }
}


function toSeasonChart(){
  d3.selectAll(".chartHolder > *").remove();
    
  var x = d3.scaleBand().range([0, chartXMax]).padding(0.1)
      .domain(chartData.map((d)=>d[0]));
    
  svg.append("g")
    .attr("transform", "translate(0," + chartYMax + ")")
    .call(d3.axisBottom(x));

  const y = d3.scaleLinear()
    .domain([0, d3.max(chartData, (d) => d[1])])
    .range([ chartYMax, 0]);
    
  svg.append("g")
    .call(d3.axisLeft(y));
    
  svg
    .selectAll(".bar")
    .data(chartData)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d) => x(d[0]) + x.bandwidth() / 4)
    .attr("y", (d) => y(d[1]))
    .attr("width", x.bandwidth() / 2)
    .transition()
    .duration(2000)
    .attr("height", (d) => chartYMax - y(d[1]))
    .style("fill", "#BB0000");
    
  svg
    .selectAll(".barValue")//the only reason it was done like this is because you cant put text into rect
    .data(chartData)
    .enter()
    .append("text")
    .text((d) => d[1]) 
    .attr("x", (d) => x(d[0]) + x.bandwidth()/2) 
    .attr("y", (d) => {if(y(d[1])<400){return 300-(200-y(d[1]));}else{return 400;}}) // these numbers probably shouldnt be tweaked
    .style("text-anchor", "middle");
        
  svg.append("text")
    .attr("x", chartXMax/2)
    .attr("y", -10)
    .attr("text-anchor", "middle")
    .style("font-size", "16px").text("Number of reports per season");
}


function toClassificationChart(){
  d3.selectAll(".chartHolder > *").remove();
  svg.append("svg")
    .append("g")
    .attr("transform","translate(" + chartMargin + "," + chartMargin + ")")
  ;
    
  var x = d3.scaleBand().range([0, chartXMax]).padding(0.1)
      .domain(chartData.map((d)=>d[0]));
    
  svg.append("g")
    .attr("transform", "translate(0," + chartYMax + ")")
    .call(d3.axisBottom(x));

  const y = d3.scaleLinear()
    .domain([0, d3.max(chartData, (d) => d[1])])
    .range([ chartYMax, 0]);
    
  svg.append("g")
    .call(d3.axisLeft(y));
    
  svg
    .selectAll(".bar")
    .data(chartData)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d) => x(d[0]) + x.bandwidth() / 4)
    .attr("y", (d) => y(d[1]))
    .transition()
    .duration(2000)
    .attr("width", x.bandwidth() / 2)
    .attr("height", (d) => chartYMax - y(d[1]))
    .style("fill", "#BB0000");

    svg
    .selectAll(".barValue")
    .data(chartData)
    .enter()
    .append("text")
    .text((d) => d[1]) 
    .attr("x", (d) => x(d[0]) + x.bandwidth()/2) 
    .attr("y", (d) => {if(y(d[1])<400){return 300-(200-y(d[1]));}else{return 400;}})
    .style("text-anchor", "middle");
        
  svg.append("text")
    .attr("x", chartXMax/2)
    .attr("y", -10)
    .attr("text-anchor", "middle")
    .style("font-size", "16px").text("Types of reports: A-visual B-noises C-other");
}


function toWeatherChart(){
  d3.selectAll(".chartHolder > *").remove();
  svg.append("svg")
    .append("g")
    .attr("transform","translate(" + chartMargin + "," + chartMargin + ")")
  ;
    
  var x = d3.scaleBand().range([0, chartXMax]).padding(0.1)
      .domain(chartData.map((d)=>d[0]));
    
  svg.append("g")
    .attr("transform", "translate(0," + chartYMax + ")")
    .call(d3.axisBottom(x));

  const y = d3.scaleLinear()
    .domain([0, d3.max(chartData, (d) => d[1])])
    .range([ chartYMax, 0]);
    
  svg.append("g")
    .call(d3.axisLeft(y));
    
  svg
    .selectAll(".bar")
    .data(chartData)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d) => x(d[0])+ x.bandwidth() / 4)
    .attr("y", (d) => y(d[1]))
    .transition()
    .duration(2000)
    .attr("width", x.bandwidth() / 2)
    .attr("height", (d) => chartYMax - y(d[1]))
    .style("fill", "#BB0000");
        
  svg
    .selectAll(".barValue")
    .data(chartData)
    .enter()
    .append("text")
    .text((d) => d[1]) 
    .attr("x", (d) => x(d[0]) + x.bandwidth()/2) 
    .attr("y", (d) => {if(y(d[1])<300){return 300-(200-y(d[1]));}else{return 380;}})
    .style("text-anchor", "middle");

  svg.append("text")
    .attr("x", chartXMax/2)
    .attr("y", -10)
    .attr("text-anchor", "middle")
    .style("font-size", "16px").text("Weather during report");
}


function toYearChart(){
  d3.selectAll(".chartHolder > *").remove();
  svg.append("svg")
    .append("g")
    .attr("transform","translate(" + chartMargin + "," + chartMargin + ")")
  ;
    
  var x = d3.scaleBand().range([0, chartXMax]).padding(0.1)
      .domain(chartData.map((d)=>d[0]));

  var xAxis=d3.axisBottom(x)
  .tickValues(x.domain().filter((d, i) => i % 5 === 0));
    
  svg.append("g")
    .attr("transform", "translate(0," + chartYMax + ")")
    .call(xAxis);

  const y = d3.scaleLinear()
    .domain([0, d3.max(chartData, (d) => d[1])])
    .range([ chartYMax, 0]);

    
  svg.append("g")
    .call(d3.axisLeft(y));
    
  var line = d3.line()
    .x((d) => x(d[0]) + x.bandwidth() / 2) 
    .y((d)=>  y(d[1]) ) 
    .curve(d3.curveMonotoneX)
    
    svg.append("path")
    .datum(chartData) 
    .attr("class", "line")
    .attr("d", line)
    .style("fill", "none")
    .style("stroke", "#CC0000")
    .style("stroke-width", "2");

  svg.append('g')
    .selectAll("dot")
    .data(chartData)
    .enter()
    .append("circle")
    .attr("cx",  (d) => x(d[0]) + x.bandwidth() / 2 )
    .attr("cy", (d)=>  y(d[1]) )
    .attr("r", 3)
    .style("fill", "#CC0000")
    .on("mouseenter", (d)=>{ 
      d3.select(d3.event.target)
      .transition()
      .duration(300)
      .style("fill", "blue")
      .attr("r",5);
      showChartValue(d);})
    .on("mouseleave", (d)=>{
      d3.select(d3.event.target)
      .transition()
      .duration(500)
      .style("fill", "#CC0000")
      .attr("r",3)
      hideChartValue();
      });

        
  svg.append("text")
    .attr("x", chartXMax/2)
    .attr("y", -10)
    .attr("text-anchor", "middle")
    .style("font-size", "16px").text("Number of reports per year");

  svg.append("g")
  .attr("class","dotValueContainer")
  .attr("transform","translate(" + chartMargin + "," + chartMargin + ")")
  .append("text").style("font-size", "16px");
}


function afterFetchInit(){
  setChartData("1");
}


function toMap(){
  mapDisplay.style.display="block";
  chartDisplay.style.display="none";
}
function toChart(){
  mapDisplay.style.display="none";
  chartDisplay.style.display="block";
}

getData();
populateOptions(1953,2021);
yearSelector.addEventListener('change',()=>reloadMap(yearSelector.value));
chartSelector.addEventListener('change',()=>setChartData(chartSelector.value));
detailsCloser.addEventListener('click',()=>hideDetails());
document.getElementById("mapButton").addEventListener('click',()=>toMap());
document.getElementById("chartButton").addEventListener('click',()=>toChart());