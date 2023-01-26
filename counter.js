var listOfObjects = [

];

function edit(id) {
    listOfObjects = getlistOfObjects();
    do {
        bet = prompt('Type bet (number)');
        if (isNumeric(bet)) {
            break
        }
    } while (!isNumeric(bet))
    objIndex = listOfObjects.findIndex((obj => obj.id == id));

    listOfObjects[objIndex].curBet = bet
    savelistOfObjects(listOfObjects)
    render()
}

function removeObjectWithId(arr, id) {
    const objWithIdIndex = arr.findIndex((obj) => obj.id === id);

    if (objWithIdIndex > -1) {
        arr.splice(objWithIdIndex, 1);
    }

    return arr;
}

function del(id) {
    if (confirm('Are you sure you want to delete?')) {
        savelistOfObjects(removeObjectWithId(getlistOfObjects(), id))
        render()
        
      } else {

      }

}

function sub(id) {
    listOfObjects = getlistOfObjects();
    objIndex = listOfObjects.findIndex((obj => obj.id == id));
    
    listOfObjects[objIndex].curChips -= +listOfObjects[objIndex].curBet
    savelistOfObjects(listOfObjects)
    render()
}

function add(id) {
    listOfObjects = getlistOfObjects();
    objIndex = listOfObjects.findIndex((obj => obj.id == id));
    
    listOfObjects[objIndex].curChips += +listOfObjects[objIndex].curBet
    savelistOfObjects(listOfObjects)
    render()
}




function savelistOfObjects(listOfObjects) {
    localStorage.setItem("listOfObjects", JSON.stringify(listOfObjects));
}

function getlistOfObjects() {
    listOfObjects = JSON.parse(localStorage.getItem("listOfObjects") || "[]");
    return listOfObjects
}

function addUser() {
    // let userName = prompt('Type Username');
    // let bet = prompt('Type bet (number)');
    do {
        userName = prompt('Type Type Username');
        if (userName != "" && (userName != null)) {
            break
        }
    } while (userName == "" || (userName == null))
    do {
        bet = prompt('Type bet (number)');
        if (isNumeric(bet)) {
            break
        }
    } while (!isNumeric(bet))
    listOfObjects = getlistOfObjects();
    id = new Date().valueOf();;

    newUser = { id: id, name: userName, curChips: 0, curBet: bet }

    listOfObjects.push(newUser)
    savelistOfObjects(listOfObjects)

    render()
}

//check element is number or not
function isNumeric(str) {
    if (typeof str != "string") return false; // we only process strings!
    return (
        !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
        !isNaN(parseFloat(str))
    ); // ...and ensure strings of whitespace fail
}

function render() {
    contentBody = document.getElementById("content-body");
    contentBody.innerHTML = ""
    content = ""

    listOfObjects = getlistOfObjects();

    for (var key in listOfObjects) {
        if (listOfObjects.hasOwnProperty(key)) {

            curContent = `<div
            class="counter-body"
            style="padding: 15px;margin-top:20px"
          >
            <!-- for each counter -->
            <div>
              <!-- button down  -->
              <div style="display: flex;">
                <!-- edit button  -->
                <div class="left-right-button-body">
                  <button onclick="edit(`+ listOfObjects[key].id + `)" class="filled btn-up edit-btn">Edit</button>
                </div>
                <!-- gap  -->
                <div style="padding: 10px;">
                <small>Bet</small>
                  <div style="width: 100%; font-size: 0.5em;">RM`+ listOfObjects[key].curBet + `</div>
                </div>
                <!-- del button  -->
                <div class="left-right-button-body">
                  <button onclick="del(`+ listOfObjects[key].id + `)" class="filled btn-up del-btn">Del</button>
                </div>
              </div>
  
              <!-- info -->
              <div
                class="info"
                style="display: flex"
              >
                <div class="name-box">`+ listOfObjects[key].name + `</div>
              </div>
              <!-- button down  -->
              <div style="display: flex">
                <!-- left button  -->
                <div class="left-right-button-body">
                  <button onclick="sub(`+ listOfObjects[key].id + `)" class="filled left-right-button left-button">-</button>
                </div>
                <!-- gap  -->
                <div style="padding: 10px;">
                  <div style="width: 100%">RM</div>
                  <div style="width: 100%;text-align:center">`+ listOfObjects[key].curChips + `</div>
                </div>
                <!-- right button  -->
                <div class="left-right-button-body">
                  <button onclick="add(`+ listOfObjects[key].id + `)" class="filled left-right-button right-button">+</button>
                </div>
              </div>
            </div>
            
          </div>`

            content += curContent

        }
        contentBody.innerHTML = content
    }
}

window.addEventListener("load", (event) => {
    render()
});