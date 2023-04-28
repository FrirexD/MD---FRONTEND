const USER_URL = "http://localhost:3000/users";
const table = document.querySelector("#users");
const form = document.querySelector("form");

const user_checker = {
    first: /^[A-Za-z-]+$/,
    last: /^[A-Za-z-]+$/,
    email: /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,3}$/,
    company: /^[A-Za-z- ]+$/,
    country: /^[A-Za-z- ]+$/
};

const keys = ["first", "last", "email", "company", "country"];

// l'user qu'on veut edit
let current_user;

/**
 * Fetch et refresh users
 */
const get_users = () => fetch(USER_URL)
    .then(res => res.json())
    .then(json => refreshTable(json));

/**
 * Refresh table
 * @param {User[]} users database
 */
const refreshTable = users => {
    // clear
    table.innerHTML = "";

    // Boucle dans tous les users
    for (let user of users) {
        let row = document.createElement("tr");
        row.id = "user-" + user.id;

        row.innerHTML = `
            <td>${user.first}</td>
            <td>${user.last}</td>
            <td>${user.email}</td>
            <td>${user.company}</td>
            <td>${user.country}</td>
            <td>${user.created_at}</td>
            <td><img onclick="start_edit(${user.id})" src="edit.svg"/></td>
            <td><img onclick="delete_user(${user.id})" src="delete.svg"/></td>
        `;

        // ajoute un ligne a notre tableau
        table.appendChild(row);
    }
};

form.addEventListener("submit", event => {
    let rawdata = new FormData(form);
    let data = {};

    rawdata.forEach((value, key) => {
        //Erreures 
        if (value.match(user_checker[key]) == null) {
            document.getElementById("error").innerHTML = "Vérifiez les informations";
            event.preventDefault();
            return;
        }

        data[key] = value;
    });

    //Rends les inputs après ajout vide (on le clear)
    for (let input of document.querySelectorAll("form input:not([type='submit'])")) {
        input.value = "";
    }

    event.preventDefault();
    return add_user(data);
});

/**
 * Ajoute un utilisateur dans notre database et on refresh le tableau
 * @param {User} user l'utilisateur a ajouter
 */
const add_user = user => fetch(USER_URL, {
   method: "post",
   headers: {
        "Content-Type": "application/json"
   },
   body: JSON.stringify(user)
}).then(get_users);


/**
 * init l'edit 
 * @param {number} id l'id de l'utilisateur a modifier
 */
const start_edit = id => {
    let row = document.getElementById("user-" + id);
    let row_data = row.children;

    current_user = {id: id};

    for (let i = 0 ; i < keys.length ; i++) {
        current_user[keys[i]] = row_data[i].innerHTML;
        row_data[i].innerHTML = `<input type="text" value="${current_user[keys[i]]}">`;
    }

    row_data[6].innerHTML = `<img onclick="edit_user()" src="done.svg"/>`;
    row_data[7].innerHTML = `<img onclick="cancel_edit()" src="cancel.svg"/>`;

};


/**
 * Arret de l'edit
 */
const cancel_edit = () => {
    let row = document.getElementById("user-" + current_user.id);
    let row_data = row.children;

    for (let i = 0 ; i < keys.length ; i++) {
        row_data[i].innerHTML = current_user[keys[i]];
    }

    row_data[6].innerHTML = `<img onclick="start_edit(${current_user.id})" src="edit.svg"/>`;
    row_data[7].innerHTML = `<img onclick="delete_user(${current_user.id})" src="delete.svg"/>`;
};


/**
 * edit dans la database
 */
const edit_user = () => {
    // Get form info
    let new_user = {};
    let row = document.getElementById("user-" + current_user.id);
    let row_data = row.children;

    for (let i = 0 ; i < keys.length ; i++) {
        // Check info
        if (row_data[i].firstChild.value.match(user_checker[keys[i]]) == null) {
            alert("Verifiez les informations"); // Luv u 1995
            return cancel_edit();
        }

        new_user[keys[i]] = row_data[i].firstChild.value;
    }

    //On envoie l'utilisateur
    fetch(USER_URL, {
        method: "put",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            id: current_user.id,
            to_edit: new_user
        })
    }).then(get_users);
};

/**
 * supprimer un utilisateur dans la database
 * @param {number} id l'id de l'user
 */
const delete_user = id => {
    if (!confirm("Etes-vous sur de supprimer l'utilisateur ?")) {
        return;
    }

    fetch(USER_URL, {
        method: "delete",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            id: id
        })
    }).then(get_users);
};

get_users();