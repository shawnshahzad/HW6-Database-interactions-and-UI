//inspired by and crediting multiple resources:
//github.com, www.w3schools.com, .javascripttutorial.net, udemy/colt steele, mdn

document.getElementById('addExerciseButton').addEventListener('click', function (event) {      //Add functionality to addExerciseButton	


    // transfer data from webserver using http
    //https://www.tutorialspoint.com/ajax/what_is_xmlhttprequest.htm#:~:text=XMLHttpRequest%20(XHR)%20is%20an%20API,%2DSide%20and%20Server%2DSide.
    var http = new XMLHttpRequest();

    //Get form id so we can edit it
    var addWorkout = document.querySelector("#addExercise");               

    //user entered information and inserting into the table
    var name = addWorkout.elements.exercise.value;
    var reps = addWorkout.elements.reps.value;
    var weight = addWorkout.elements.weight.value;
    var date = addWorkout.elements.date.value;
    var unit = addWorkout.elements.unit.value;

    //parameters are set to POST
    var data = "?" +"exercise=" + name + "&reps=" + reps + "&weight=" + weight + "&date=" + date + "&unit=" + unit;

  

    //set true for aysnc and used to send the proper header with request to insert route
    http.open("POST", "/" + data, true);   
    //    The Media type of the body of the request (used with POST and PUT requests).
    http.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    //http request loaded after webpage has fully loaded
    http.addEventListener('load', function () {         
        
        if (this.status >= 200 && this.status < 400) {

            var response = JSON.parse(http.responseText);          
            var id = response.data;

            //table is saved 
            var table = document.getElementById("workOut");  

            //*********************************************************** */
            //row to add to the workout table

            var table_line = table.insertRow();                          

            var name1 = document.createElement('td'); 
            var reps1 = document.createElement('td');
            var weight1 = document.createElement('td');
            var date1 = document.createElement('td');
            var unit1 = document.createElement('td');
            
            name1.textContent = name;
            reps1.textContent = reps;
            weight1.textContent = weight;
            date1.textContent = date;
            unit1.textContent = unit;

            table_line.append(name1);
            table_line.append(reps1);
            table_line.append(weight1);
            table_line.append(date1);
            table_line.append(unit1);
            //*********************************************************** */

            
            

            var updateData = document.createElement('td');              //This will add an update button to the table to redirect to a different page and update the exercise
            var updateDataLink = document.createElement('a');
            updateDataLink.setAttribute('href', '/updateWorkOutTable?id=' + id);      //Place in our views folder so we redirect here so we set it's href value to the handlebars file
            var updateButton = document.createElement('input');         //Create the button
            updateButton.setAttribute('value', 'Update');       //Set the attributes for the button
            updateButton.setAttribute('type', 'button');
            updateDataLink.appendChild(updateButton);
            updateData.appendChild(updateDataLink);
            table_line.append(updateData);                            //Add the button to the table data            


            
            var deleteCell = document.createElement('td');                  //This will add a delete button to remove exercises
            var deleteButton = document.createElement('input');             //Create button
            deleteButton.setAttribute('type','button');
            deleteButton.setAttribute('name', 'delete');                     //Set the attributes for it
            deleteButton.setAttribute('value','Delete');
            deleteButton.setAttribute('onClick', 'deleteData("dataTable",' + id + ')');
            var deleteHidden = document.createElement('input');             //Hidden input to remove elements from database (taken from Helpful Suggestions on assignment page)
            deleteHidden.setAttribute('type', 'hidden');
            deleteHidden.setAttribute('id', 'delete' + id);
            deleteCell.appendChild(deleteButton);                           //Add both to the cell
            deleteCell.appendChild(deleteHidden);
            table_line.appendChild(deleteCell);                                    //Add to the table itself

        }
        else {
            console.log("error");
        }
    });

    //Send the request to the server
    http.send("/" + data);                           
    event.preventDefault();                                     
});

//function to delete row with associated id
function deleteData(deletes, id) {                               
    var deleteRow = "delete" + id;                            	
    var table = document.getElementById("workOut");       
    var numRows = table.rows.length;


    //get access to all the rows in hte table
    for (var i = 1; i < numRows; i++) {                           
        var row = table.rows[i];
        var findData = row.getElementsByTagName("td");		    
        var erase = findData[findData.length - 1];
        //remove this id from table if it is equal to the index
        if (erase.children[1].id === deleteRow) {                
            table.deleteRow(i);
        }

    }

    var http = new XMLHttpRequest();


    //request to delete data
    http.open("DELETE", "/?id=" + id, true);             

    //ensure status is good
    http.addEventListener("load", function () {
        if (http.status >= 200 && http.status < 400) {         
            console.log('success');
        } else {
            console.log('error');
        }
    });

    // send the delete request with corresponding ID to delete route
    http.send("/?id=" + id);                           

}