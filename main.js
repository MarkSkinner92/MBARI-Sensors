/*
  Created by Mark Skinner March 11, 2021
  markhskinner@gmail.com
*/


//you can find this in the url of your google sheet. The sheet must be published, and no API is needed
var sheetID = '16y1ZUR_HXVSG-OPxCPDVQ-5WpPFl1dv4Rn1Uv0x0QkI';

var gotData = false;
var data = []; //local copy of spreadsheet that's more readable
var layouts = [];

$(document).ready( function() {
    var now = new Date();
    var month = (now.getMonth() + 1);
    var day = now.getDate();
    if (month < 10)
        month = "0" + month;
    if (day < 10)
        day = "0" + day;
    var today = now.getFullYear() + '-' + month + '-' + day;
    $('#date').val(today);
});


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

//json callback
function doData(json) {
    let spData = json.feed.entry;
    data = [];
    spData.forEach((item, i) => {
      let t = item.gs$cell;
      if(!data[t.col]) data[t.col] = [];
      data[t.col][t.row] = t.$t;
    });
}

function getSheet(pageIndex = 1) {
  if(pageIndex < 1){
    document.getElementById('waiting').style.display = 'none';
    document.getElementById('error').style.display = 'inline';
    setLabels(false);
  }
  if(pageIndex <= 35){ //limit to 35 pages of history
    $.getScript(`https://spreadsheets.google.com/feeds/cells/${sheetID}/${pageIndex}/public/values?alt=json-in-script&callback=doData`)
    .done(function( script, textStatus ) {
      // console.log( textStatus );
      document.getElementById('error').style.display = 'none';
      updateGraphs();
    })
    .fail(function( jqxhr, settings, exception ) {
      console.log('could not get GS', jqxhr, settings, exception);
      document.getElementById('waiting').style.display = 'none';
      document.getElementById('error').style.display = 'inline';
      setLabels(false);
    });
  }else{
    document.getElementById('waiting').style.display = 'none';
    document.getElementById('error').style.display = 'inline';
    setLabels(false);
  }
}

function dateChangeCallback(date){
  getSheet(datediff(parseDate(date)));
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
  var i = 3; //0 is empty, and 1 is timestamp and 2 is pi temp
  for(i;i < 8; i++){
    mdata.push({
      x: time,
      y: getCol(i),
      type: 'scattergl',
      name: data[i][1],
    });
  }
  divs[0] = document.getElementById('ROVgraph');
  Plotly.plot(divs[0], mdata, layout, config);

  mdata = [];
  for(i; i < 14; i++){
    mdata.push({
      x: time,
      y: getCol(i),
      type: 'scattergl',
      name: data[i][1],
    });
  }
  divs[1] = document.getElementById('Lightsgraph');
  Plotly.plot(divs[1], mdata, layout, config);

  mdata = [];
  for(i; i < 17; i++){
    mdata.push({
      x: time,
      y: getCol(i),
      type: 'scattergl',
      name: data[i][1],
    });
  }
  divs[2] = document.getElementById('Hydrophone');
  Plotly.plot(divs[2], mdata, layout, config);

  mdata = [];
  for(i; i < 19; i++){
    mdata.push({
      x: time,
      y: getCol(i),
      type: 'scattergl',
      name: data[i][1],
    });
  }
  divs[3] = document.getElementById('Camera');
  Plotly.plot(divs[3], mdata, layout, config);

  mdata = [];
  for(i; i < 27; i++){
    mdata.push({
      x: time,
      y: getCol(i),
      type: 'scattergl',
      name: data[i][1],
    });
  }
  divs[4] = document.getElementById('Atmosphere');
  Plotly.plot(divs[4], mdata, layout, config);

  mdata = [];
  for(i; i < 29; i++){
    mdata.push({
      x: time,
      y: getCol(i),
      type: 'scattergl',
      name: data[i][1],
    });
  }
  divs[5] = document.getElementById('Fan');
  Plotly.plot(divs[5], mdata, layout, config);

  divs.forEach((div,i) => {
      div.on("plotly_relayout", function(ed) {
        // console.log(div.layout);
        divs.forEach((div2,j) => {
          if(div2 != div) Plotly.update(div2,{},div.layout);
        });
      });
  });
}

function getFormatedTime(d){
  return Array.from(d[1], x => dayjs(parseInt(x)*1000).format('h:mm:ss a')).slice(2);
}
function getCol(c){
  return data[c].slice(2);
}
//when all the scripts have loaded, create the graph(s)
$(document).ready(function(){
    document.getElementById('sheetlink').href = `https://docs.google.com/spreadsheets/d/${sheetID}`;
    getSheet();
});
