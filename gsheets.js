// Client ID and API key from the Developer Console
var SHEET_ID = '16y1ZUR_HXVSG-OPxCPDVQ-5WpPFl1dv4Rn1Uv0x0QkI';
var CLIENT_ID = '1098630250359-akb40thocnjh6vaaavltm9h6eslng069.apps.googleusercontent.com';
var API_KEY = 'AIzaSyD3PFZZEG8O4sdOl2JnTOnOJQIXOhqfqVs';
var DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];
var SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";
var signedIn = false;

window.onload = function(){
  document.getElementById('signinbutton').onclick = function(){
    userSignIn();
  }
}

function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}
function updateSigninStatus(isSignedIn){
  console.log('Signed in:',isSignedIn);
  signedIn = isSignedIn;
  if(signedIn){
    document.getElementById('signin').style.display = 'none';
    onSignin();
  }
  else{
    document.getElementById('signin').style.display = 'unset';
  }
}
function initClient() {
  gapi.client.init({
    apiKey: API_KEY,
    clientId: CLIENT_ID,
    discoveryDocs: DISCOVERY_DOCS,
    scope: SCOPES
  }).then(function () {
    // Listen for sign-in state changes.
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

    // Handle the initial sign-in state.
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
  }, function(error) {
    appendPre(JSON.stringify(error, null, 2));
  });
}

function userSignIn() {
  gapi.auth2.getAuthInstance().signIn();
}
function userSignOut() {
  gapi.auth2.getAuthInstance().signOut();
}

function getTabData(tabname) {
  gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: tabname+'!A:AE',
  }).then(function(response) {
    var range = response.result.values;
    document.getElementById('error').style.display = 'none';
    // console.log(range);
    data = transpose(range);
    console.log(data);
    updateGraphs();
  }, function(response) {
    console.log('error' + response);
    document.getElementById('waiting').style.display = 'none';
    document.getElementById('error').style.display = 'inline';
    setLabels(false);
  });
}

var tabNames = [];
function getAndGenerateTabNames(){
  gapi.client.sheets.spreadsheets.get({
        spreadsheetId: SHEET_ID
    }).then(function(response) {
        let options = '';
        let sheet = response.result.sheets;
        for(let i = 0 ; i < sheet.length; i++){
          tabNames.push(sheet[i].properties.title);
          options += `<option>${sheet[i].properties.title}</option>`;
        }
        sheetNames = sheet;
        getTabData(tabNames[0]);
        document.getElementById('date').innerHTML = '';
        document.getElementById('date').insertAdjacentHTML('beforeend',options);
    }, function(response) {
        console.log('Error: ' + response.result.error.message);
    });
}

function onSignin(){
  getAndGenerateTabNames();
}

//https://hashinteractive.com/blog/javascript-transpose-matrix-rows-to-columns/
const transpose = (matrix) => {
  let [row] = matrix
  return row.map((value, column) => matrix.map(row => row[column]))
}
