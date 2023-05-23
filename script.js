const circleContainer=document.querySelector('.circle-container');
const detailsContainer=document.querySelector('.details-tab');
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
    detailsContainer.innerHTML=`
        <p>Report Details:</p>
        <p>Title: ${reportJson.title}</p> 
        <p>Date: ${reportJson.date}</p> 
    `;
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
    .attr("x", (d) => x(d[0]))
    .attr("y", (d) => y(d[1]))
    .attr("width", 100)
    .attr("height", (d) => chartYMax - y(d[1]));
        
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
    .attr("x", (d) => x(d[0]))
    .attr("y", (d) => y(d[1]))
    .attr("width", 100)
    .attr("height", (d) => chartYMax - y(d[1]));
        
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
    .attr("x", (d) => x(d[0]))
    .attr("y", (d) => y(d[1]))
    .attr("width", 100)
    .attr("height", (d) => chartYMax - y(d[1]));
        
  svg.append("text")
    .attr("x", chartXMax/2)
    .attr("y", -10)
    .attr("text-anchor", "middle")
    .style("font-size", "16px").text("Weather during report");
}


function afterFetchInit(){
  setChartData("1");
}

getData();
populateOptions(1953,2021);
yearSelector.addEventListener('change',()=>reloadMap(yearSelector.value));
chartSelector.addEventListener('change',()=>setChartData(chartSelector.value));