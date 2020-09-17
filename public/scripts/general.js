// Retorna el parametro especificado dentro de la URL
function getURLParameter(sParam) {
  let sPageURL = window.location.search.substring(1);
  let sURLVariables = sPageURL.split("&");
  for (var i = 0; i < sURLVariables.length; i++) {
    let sParameterName = sURLVariables[i].split("=");
    if (sParameterName[0] == sParam) {
      return sParameterName[1];
    }
  }
}

/* Fetched films */
async function getFilms() {
  const response = await fetch("/fetched");
  const result = await response.json();
  let content = "No results";
  if (result.length > 0) {
    content = "";
    result.forEach((element) => {
      let title = document.createElement("a");
      title.href = `/search?title=${element.title}&year=${element.year}&auto=1`;
      let text = document.createTextNode(`${element.title} (${element.year}) `);
      title.appendChild(text);
      document.getElementById("content").appendChild(title);
      fetched = document.createElement("span");
      text = document.createTextNode(`${element.fetched})`);
      fetched.className = "w3-text-grey";
      fetched.appendChild(text);
      document
        .getElementById("content")
        .appendChild(document.createElement("br"));
      document.getElementById("content").appendChild(fetched);
      document
        .getElementById("content")
        .appendChild(document.createElement("br"));
    });
  }
}

/* Latest searches */
async function getLatest() {
  const response = await fetch("/logged?count=20");
  const result = await response.json();
  let content = "No results";
  if (result.length > 0) {
    content = "";
    result.forEach((element) => {
      let title = document.createElement("h5");
      let text = document.createTextNode(`${element.film} (${element.year}) `);
      title.appendChild(text);
      document.getElementById("content").appendChild(title);
      p = document.createElement("p");
      let user = element.user || "anonymous";
      text = document.createTextNode(`By ${user} on ${element.created}) `);
      p.className = "w3-text-grey";
      p.appendChild(text);
      document.getElementById("content").appendChild(p);
    });
  }
}
