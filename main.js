/*
  Created by Mark Skinner March 11, 2021
  markhskinner@gmail.com
*/

var gotData = false;
var data = []; //local copy of spreadsheet that's more readable
var layouts = [];

var layout = {
  height:400,
  plot_bgcolor:"#121212",
  paper_bgcolor:"#1d1d1d",
  yaxis: {
    fixedrange: true
  },
  font: {
    family: 'Poppins',
    size: 13,
    color: '#AAA'
  },
  margin: {
    l: 50,
    r: 300,
    b: 100,
    t: 50,
    pad: 4
  }
}
var config = {
  responsive: true,
  displayModeBar: true
};
//https://docs.google.com/spreadsheets/d/16y1ZUR_HXVSG-OPxCPDVQ-5WpPFl1dv4Rn1Uv0x0QkI

function dateChangeCallback(date){
  console.log('change:',date);
  getTabData(date);
    document.getElementById('waiting').style.display='inline';
    setLabels(false);
    document.getElementById('error').style.display = 'none';
  Plotly.purge('ROVgraph');
  Plotly.purge('Lightsgraph');
  Plotly.purge('Hydrophone');
  Plotly.purge('Camera');
  Plotly.purge('Atmosphere');
  Plotly.purge('Fan');
}
function parseDate(str) {
  var b = str.split(/\D/);
  return new Date(b[0], --b[1], b[2]);
}

function datediff(first) {
    return Math.round((new Date().getTime() -first)/(1000*60*60*24));
}

function setLabels(state){
  const c = document.getElementsByClassName('graphTitle');
  for(let i = 0; i < c.length; i++) c[i].style.display = state?'block':'none';
}

var divs = [];
function updateGraphs(){
  document.getElementById('waiting').style.display='none';
  setLabels(true);
  var mdata = [];
  let time = getFormatedTime(data);
  var i = 2; //0 is timestamp and 1 is pi temp
  for(i;i < 7; i++){
    mdata.push({
      x: time,
      y: getCol(i),
      type: 'scattergl',
      name: data[i][0],
    });
  }
  divs[0] = document.getElementById('ROVgraph');
  Plotly.plot(divs[0], mdata, layout, config);

  mdata = [];
  for(i; i < 13; i++){
    mdata.push({
      x: time,
      y: getCol(i),
      type: 'scattergl',
      name: data[i][0],
    });
  }
  divs[1] = document.getElementById('Lightsgraph');
  Plotly.plot(divs[1], mdata, layout, config);

  mdata = [];
  for(i; i < 16; i++){
    mdata.push({
      x: time,
      y: getCol(i),
      type: 'scattergl',
      name: data[i][0],
    });
  }
  divs[2] = document.getElementById('Hydrophone');
  Plotly.plot(divs[2], mdata, layout, config);

  mdata = [];
  for(i; i < 18; i++){
    mdata.push({
      x: time,
      y: getCol(i),
      type: 'scattergl',
      name: data[i][0],
    });
  }
  divs[3] = document.getElementById('Camera');
  Plotly.plot(divs[3], mdata, layout, config);

  mdata = [];
  for(i; i < 26; i++){
    mdata.push({
      x: time,
      y: getCol(i),
      type: 'scattergl',
      name: data[i][0],
    });
  }
  divs[4] = document.getElementById('Atmosphere');
  Plotly.plot(divs[4], mdata, layout, config);

  mdata = [];
  for(i; i < 28; i++){
    mdata.push({
      x: time,
      y: getCol(i),
      type: 'scattergl',
      name: data[i][0],
    });
  }
  divs[5] = document.getElementById('Fan');
  Plotly.plot(divs[5], mdata, layout, config);

  divs.forEach((div,i) => {
      div.on("plotly_relayout", function(ed) {
        divs.forEach((div2,j) => {
          if(div2 != div) Plotly.update(div2,{},div.layout);
        });
      });
  });
}

function getFormatedTime(d){
  return Array.from(d[0], x => dayjs(parseInt(x)*1000).format('h:mm:ss a')).slice(2);
}
function getCol(c){
  return data[c].slice(1); //omit first element in column because it's a label
}
//when all the scripts have loaded, create the graph(s)
$(document).ready(function(){
    document.getElementById('sheetlink').href = `https://docs.google.com/spreadsheets/d/${SHEET_ID}`;
});
