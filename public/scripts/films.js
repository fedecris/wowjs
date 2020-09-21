/* Fetched films */
async function getFilms() {
  const response = await fetch("/films/fetched");
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
