/*
  Created by Mark Skinner March 11, 2021
  markhskinner@gmail.com
*/


//you can find this in the url of your google sheet. The sheet must be published, and no API is needed
var sheetID = '16y1ZUR_HXVSG-OPxCPDVQ-5WpPFl1dv4Rn1Uv0x0QkI';

var gotData = false;
var data = []; //local copy of spreadsheet that's more readable


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
  yaxis: {
    fixedrange: true
  },
  margin: {
    l: 50,
    r: 300,
    b: 100,
    t: 50,
    pad: 4
  },
  title: {
    text:'Plot Title',
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
  if(pageIndex < 1) pageIndex = 1;
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
    });
  }else{
    document.getElementById('waiting').style.display = 'none';
    document.getElementById('error').style.display = 'inline';
  }
}

function dateChangeCallback(date){
  getSheet(datediff(parseDate(date)));
    document.getElementById('waiting').style.display='inline';
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

var divs = [];
function updateGraphs(){
  document.getElementById('waiting').style.display='none';
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
  layout.title.text = 'ROV';
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
  layout.title.text = 'Lights';
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
  layout.title.text = 'Hydrophone';
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
  layout.title.text = 'Camera';
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
  layout.title.text = 'Atmosphere';
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
  layout.title.text = 'Fan';
  Plotly.plot(divs[5], mdata, layout, config);

  divs.forEach((div,i) => {
      div.on("plotly_relayout", function(ed) {
        console.log('relayout others');
        divs.forEach(div2 => {
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
