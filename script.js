const circleContainer=document.querySelector('.circle-container');
const detailsContainer=document.querySelector('.details-tab');
const yearSelector=document.querySelector('#years');
const yearCounter=document.querySelector('.year-counter');
var data =[];

async function getData(){
    await fetch('./converted.json')
    .then((response) => response.json())
    .then((json) => data=json)
    fillMap();
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
    if(newCircle.style.top<-10){
        console.log(2);
    }
        
    newCircle.innerHTML=`
        <circle cx="3" cy="3" r="3" fill="red" />
    `;
    circleContainer.appendChild(newCircle);
    newCircle.addEventListener('click',()=>setDetails(reportJson));
}
function setDetails(reportJson){
    detailsContainer.innerHTML=`
        <p>${reportJson.title}</p> 
        <p>${reportJson.latitude}</p>
        <p>${reportJson.longitude}</p> 
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
getData();
populateOptions(1953,2021);
yearSelector.addEventListener('change',()=>reloadMap(yearSelector.value));