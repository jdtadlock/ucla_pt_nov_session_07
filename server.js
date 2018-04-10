const request = require('request');
const cheerio = require('cheerio');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/scraping_example');
mongoose.Promise = Promise;

const ArticleSchema = mongoose.Schema({
  title: String,
  body: String
});

const Article = mongoose.model('Article', ArticleSchema);


// Article.find({}).then(articles => console.log(articles));

const app = express();


app.use(express.static(path.join(__dirname, 'public')));


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/* ROUTES */

// View Route
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'views/index.html')));

// API Routes
app.get('/scrape', (req, res) => {
  request('https://www.wsj.com/news/technology', function (err, response, html) {
    if (err) return console.log(err);
    let $ = cheerio.load(html);

    let articles = $('.wsj-list.lead-story .wsj-card');
    let results = Array.from(articles).filter(val => {
      return $(val).find('.wsj-card-body .wsj-summary').text();
    });

    
    results.forEach((article, index) => {
      const title = $(article).find('.wsj-headline a').text().trim();
      const body = $(article).find('.wsj-card-body .wsj-summary').text().trim();
      const send = () => Article.find({}).then(article_data => res.send(article_data));

      Article.find({ title: title }).then(article => {
        if (!article) {
          Article
            .create({ title, body }).then(result => {

              if (index === results.length - 1) send();
            })
            .catch(err => console.log(err));
        } else {
          if (index === results.length - 1) send();
        }
      });
      // console.log(`${title}\n------------\n${body}\n===============\n`);
    });
  });
});


app.listen(5000, () => console.log('Listening on 5000...'));

