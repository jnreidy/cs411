/**
 * GET /contact
 * Contact form page.
 */

const request = require('request');

//Create the AlchemyAPI object
const AlchemyAPI = require('../alchemyapi');
const alchemyapi = new AlchemyAPI();


exports.loadTrendingArticles = (req, res, next) => {

   /* const key = process.env.NEWSAPIORGKEY;

    var options = { method: 'GET',
        url: 'https://newsapi.org/v1/articles',
        qs:
        { source: 'google-news',
            apiKey: key },
        headers:
        { 'postman-token': '4aaec6f2-5a9d-fa22-8954-6fae53fd7dc3',
            'cache-control': 'no-cache' } };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        var body = JSON.parse(body);
        articles = body['articles'];
        console.log(articles.length);
    });
    return articles; */

    exports.loadTrendingArticles = (req, res, next) => {

        const key = process.env.ALCHEMYLANGUAGEKEY1;
        const resource = 'https://gateway-a.watsonplatform.net/calls/data/';
        var call = resource + 'GetNews?apikey=' + key + '&count=20&rank=high&start=now-6h&end=now&outputMode=json&return=enriched.url.url,enriched.url.title,enriched.url.docSentiment.score,enriched.url.text'

        request(call, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                /*
                 the next line should work as long as we do not use all api keys
                 if concerned about too much usage, use trending_body.json
                 */

                //var body = JSON.parse(body);
                console.log('pass')
            }

            var fs = require('fs');
            var body = JSON.parse(fs.readFileSync('trending_body.json', 'utf8'));

            articles = body['result']['docs'];
            return articles;
        });

        return articles;
    }

}

exports.getSearch = (req, res, next) => {
    var articles = exports.loadTrendingArticles();
    res.render('search',{
        title: 'Search',
        topArticles: articles
    });
};

exports.postSearch = (req, res, next) => {

    var keywordinput = req.body.keywordinput;
    var urlinput = req.body.urlinput;


    function display(req, res) {
        var output = {};

        //Start the analysis chain
        text(req, res, output);
    }

    function text(req, res, output) {
        alchemyapi.text('url', urlinput, {}, function(response) {
            output['text'] = { url:urlinput, response:JSON.stringify(response,null,4), results:response };
            sentiment(req, res, output);
        });
    }

    function sentiment(req, res, output) {
        alchemyapi.sentiment('url', urlinput, {}, function(response) {
            output['sentiment'] = { url:urlinput, response:JSON.stringify(response,null,4), results:response['docSentiment'] };
            console.log(output);

            displaySearch(output, 'URL');
        });
    }

    function displaySearch(output, type) {
        if (type == 'URL') {
            res.render( 'search/results', {
                type: 'URL',
                title: 'Search Results',
                text: output['text']['results'],
                sentiment: output['sentiment']
            });
        }

        if (type == 'KEYWORD') {
            res.render( 'search/results', {
                type: 'KEYWORD',
                title: 'Search Results',
                articles: output['result']['docs']
            });
        }
    }

    if (typeof keywordinput !== 'undefined') {
        console.log('You sent the key_word: "' + keywordinput + '".');
        var options = { method: 'GET',
            url: 'https://access.alchemyapi.com/calls/data/GetNews',
            qs:
            { apikey: process.env.ALCHEMYLANGUAGEKEY,
                return: 'enriched.url.title,enriched.url.url',
                start: '1480291200',
                end: '1480978800',
                'q.enriched.url.cleanedTitle': encodeURIComponent(keywordinput.trim()),
                count: '2',
                outputMode: 'json' },
            headers:
            { 'postman-token': '4a3e4f96-fd58-6891-ccd3-dbc1309b4f01',
                'cache-control': 'no-cache' } };

        request(options, function (error, response, body) {
            if (error){ throw new Error(error);}
            else {
                console.log('pass');
                var fs = require('fs');
                var body = JSON.parse(fs.readFileSync('keyword_body.json', 'utf8'));

                displaySearch(body, "KEYWORD");
            }
        });
    } else {
        console.log('Not posting a keyword, must be something else.');
    }

    if (typeof urlinput !== 'undefined') {
        console.log('You sent the URL: ' + urlinput);

        display(req,res);

    } else {
        console.log('Not posting a URL, must be something else.');
    }
}

