function getArticles() {
  $('#articles').empty();
  
  $.get('/scrape')
    .then(articles => {
      articles.forEach(article => {
        $('#articles').append(`
          <div class="article">
            <h2>${article.title}</h2>
            <p>${article.body}</p>
          </div>
        `);
      })
    });
}

$('#scrape').on('click', getArticles);