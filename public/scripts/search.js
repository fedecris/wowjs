/** Nomina de parsers */
let parsers = null;

// Agrega un nuevo parser a la lista de parser disponible
function appendParsersToDOM(name) {
  // Incorporar esto:
  // <p>
  //   <span class="w3-tag">IMDb:</span>
  //   <span id="imdbParser">Waiting for a film...</span>
  // </p>
  // P
  let p = document.createElement("p");
  // Span1
  let span1 = document.createElement("span");
  span1.className = "w3-tag";
  let text1 = document.createTextNode(`${name}:`);
  span1.appendChild(text1);
  // Span2
  let span2 = document.createElement("span");
  span2.id = `${name}parser`;
  let text2 = document.createTextNode(" Waiting for a film...");
  span2.appendChild(text2);
  // Incorporarlo al DOM
  p.appendChild(span1);
  p.appendChild(span2);
  let element = document.getElementById("parsersList");
  element.appendChild(p);
}

// Mostrar en pantalla los parsers disponibles
async function getParsers() {
  const response = await fetch("/api/parsers");
  parsers = await response.json();
  const subtitulo = document.getElementById("subtitulo");
  subtitulo.textContent = `Current sources: ${parsers.names}`;
}

// Carga los campos de busqueda si corresponde
function loadSearchFields() {
  let title = getURLParameter("title");
  let year = getURLParameter("year");
  document.getElementById("title").value = decodeURIComponent(title);
  document.getElementById("year").value = year;
}

// Carga la info inicial
async function loadInfo() {
  setCached("");
  setError("");
  loadSearchFields();
  await getParsers();
  parsers.names.forEach((element) => {
    appendParsersToDOM(element);
  });
  // Fetch automatico?
  let auto = getURLParameter("auto");
  if (auto) {
    doIt();
  }
}

function setError(error) {
  document.getElementById("errorText").innerHTML = error;
}

function setCached(cached) {
  document.getElementById("cachedText").innerHTML = cached;
  document.getElementById("refreshButton").disabled = cached == "";
}

// ===== Funciones relacioandas con la consulta =====
let requestID = -1;
let checks = 0;

// Barrer con todos los parsers
async function doIt(force) {
  setError("");
  setCached("");
  // Registrar el pedido
  const title = document.getElementById("title").value;
  const year = document.getElementById("year").value;
  query(title, year, force ? 1 : 0);
}

// Consultar por una pelicula con todos los parsers
async function query(title, year, force) {
  try {
    // Enviar criterio al server
    const response = await fetch(
      `/search/all?title=${encodeURIComponent(
        title
      )}&year=${year}&force=${force}`
    );
    // Recuperar id de request de busqueda
    const json = await response.json();
    if (json && json.id > -1) {
      requestID = json.id;
      if (json.cached) {
        setCached(`Retrieved ${json.cached}`);
        setTimeout(checkStatus, 1);
      } else {
        parsers.names.forEach((parserName) => {
          document.getElementById(`${parserName}parser`).textContent =
            " Retrieving info...";
        });
        setTimeout(checkStatus, 1000);
      }
    } else {
      // Devolvio un error el formulario?
      requestID = -1;
      let errorMsg = "Unknown error";
      if (json.error) {
        errorMsg = "";
        json.error.forEach((elm) => {
          errorMsg += `${elm.msg} <br>`;
        });
      }
      setError(errorMsg);
    }
  } catch (ex) {
    setError("Error conecting to server");
  }
}

function getDataInfo(json) {
  let result = "";
  if (json.publicScore) {
    result += ` ${json.publicScore} (${json.publicCount} votes) `;
  }
  if (json.criticsScore) {
    result += ` ${json.criticsScore} (${json.criticsCount} critics) `;
  }
  if (json.budget) {
    result += ` ${json.budget} budget, ${json.boxOffice} box office `;
  }
  if (json.url) {
    result += `<br> <a href="${json.url}" target="_blank">${json.url}</a> `;
  }
  if (json.error) {
    result += ` ${json.error} for ${title} (${year})`;
  }
  return result;
}

// Checkear el estado de la busqueda usando el ID de request recibido
async function checkStatus() {
  try {
    checks++;
    const statusURL = `/search/status/${requestID}`;
    const response = await fetch(statusURL);
    const parsed = await response.text();
    let recall = true;
    // Recibimos alguna info?
    if (parsed && parsed.length > 0) {
      const data = JSON.parse(parsed);
      data.forEach((element) => {
        document.getElementById(
          `${element.parser}parser`
        ).innerHTML = getDataInfo(element);
      });
      // Se recuperó toda la informacion buscada o debemos repetir polling?
      if (data.length == parsers.names.length) {
        recall = false;
        checks = 0;
        displayChart(data);
      }
    }
    if (checks >= 10) {
      checks = 0;
      recall = false;
      setError("Too many retries");
    }
    // Reconsultar en un ratitin
    if (recall) setTimeout(checkStatus, 1000);
  } catch (ex) {
    setError("Error " + ex);
  }
}

// Consultar por una pelicula bajo un parser en particular (deprecated)
async function queryForParser(title, year, parserTag, parserName) {
  document.getElementById(parserTag).textContent = " Retrieving info...";
  // Enviar criterio al server
  const response = await fetch(
    `/search/${parserName}?title=${encodeURIComponent(title)}&year=${year}`
  );
  // Recuperar data en informar la eventual informacion contenida
  const json = await response.json();
  let result = getDataInfo(json);
  document.getElementById(parserTag).textContent = result;
}

// Consultar filmsbase similares
let lastCriteria = "";
async function findFilm() {
  if (event.keyCode == 27) {
    document.getElementById("film").value = "";
  }
  let criteria = document.getElementById("film").value;
  // Si el criterio no cambion, no hacer nada
  if (lastCriteria == criteria) {
    return;
  }
  lastCriteria = criteria;
  // Si no hay criterio, vaciar la lista
  if (criteria == "") {
    autocomplete(document.getElementById("film"), []);
  }
  if (criteria.length > 0) {
    const response = await fetch(`/films/filmBasic?criteria=${criteria}`);
    const parsed = await response.json();
    if (parsed && parsed.length > 0) {
      let films = [];
      parsed.forEach((el) => films.push(`${el.title} (${el.year})`));
      autocomplete(document.getElementById("film"), films);
    }
  }
}

// Adapted from https://www.w3schools.com/howto/howto_js_autocomplete.asp
function autocomplete(inp, arr) {
  /*the autocomplete function takes two arguments,
        the text field element and an array of possible autocompleted values:*/
  var currentFocus = -1;
  var a,
    b,
    i,
    val = inp.value;
  /*close any already open lists of autocompleted values*/
  closeAllLists();
  if (!val) {
    return false;
  }
  currentFocus = -1;
  /*create a DIV element that will contain the items (values):*/
  a = document.createElement("DIV");
  a.setAttribute("id", this.id + "autocomplete-list");
  a.setAttribute("class", "autocomplete-items");
  /*append the DIV element as a child of the autocomplete container:*/
  inp.parentNode.appendChild(a);
  /*for each item in the array...*/
  for (i = 0; i < arr.length; i++) {
    /*create a DIV element for each matching element:*/
    b = document.createElement("DIV");
    /*make the matching letters bold:*/
    b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
    b.innerHTML += arr[i].substr(val.length);
    /*execute a function when someone clicks on the item value (DIV element):*/
    b.addEventListener("click", function (e) {
      /*insert the value for the autocomplete text field:*/
      inp.value = this.textContent;
      /*close the list of autocompleted values,
              (or any other open lists of autocompleted values:*/
      closeAllLists();
      // Separar informacion
      let upto = inp.value.lastIndexOf("(");
      let title = inp.value.substring(0, upto).trim();
      let year = inp.value.substring(upto + 1, inp.value.length - 1);
      document.getElementById("title").value = title;
      document.getElementById("year").value = year;
    });
    a.appendChild(b);
  }

  function addActive(x) {
    /*a function to classify an item as "active":*/
    if (!x) return false;
    /*start by removing the "active" class on all items:*/
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = x.length - 1;
    /*add class "autocomplete-active":*/
    x[currentFocus].classList.add("autocomplete-active");
  }

  function removeActive(x) {
    /*a function to remove the "active" class from all autocomplete items:*/
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }

  function closeAllLists(elmnt) {
    /*close all autocomplete lists in the document,
          except the one passed as an argument:*/
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
}
