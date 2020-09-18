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
