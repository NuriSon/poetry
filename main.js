var http = require("http");
var fs = require("fs");
var url = require("url");
var qs = require('querystring');

function templateHTML(poet, list, body) {
  return `<!doctype html>
  <html>
  <head>
    <title>${poet}</title>
    <meta charset="utf-8">
  </head>
  <body>
    <h1><a href="/">POETRY</a></h1>
    ${list}
    <a href="/create">create</a>
    ${body}
  </body>
  </html>
  `;
}

function templateList(filelist) {
  var list = "<ol>";
  var i = 0;
  while (i < filelist.length) {
    list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
    i = i + 1;
  }
  list = list + "</ol>";
  return list;
}

var app = http.createServer(function (request, response) {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  var pathname = url.parse(_url, true).pathname;
  if (pathname === "/") {
    if (queryData.id === undefined) {
      fs.readdir("./description", function (error, filelist) {
        var poet = "Hi";
        var description = "You can write your own poem";
        var list = templateList(filelist);
        var template = templateHTML(
          poet,
          list,
          `<h1>${poet}</h1>
          ${description}`);
        response.writeHead(200);
        response.end(template);
      });
      
    } else {
      fs.readdir("./description", function (error, filelist) {
        fs.readFile(
          `description/${queryData.id}`,
          `utf8`,
          function (err, description) {
            var poet = queryData.id;
            var list = templateList(filelist);
            var template = templateHTML(
              poet,
              list,
               `<h1>${poet}</h1>${description}`
              
            );
            response.writeHead(200);
            response.end(template);
          }
        );     
      });
      
    }

  } else if(pathname === '/create'){
    fs.readdir("./description", function (error, filelist) {
      var poet = "Hi";
      var list = templateList(filelist);
      var template = templateHTML(
        poet,
        list,
        `
        <form action="http://localhost:3000/create_process" method="post">
        <p><input type="text" name="name" placeholder="name"></p>
        <p><textarea name="description" placeholder="poem"></textarea>
        </p>
        <p><input type="submit">
        </P>
        </form>
        `
      );
      response.writeHead(200);
      response.end(template);
    });
  }else if(pathname === '/create_process'){
    var body = '';
    request.on('data', function(data){
      body = body + data;
    });

    request.on('end', function(){
      var post = qs.parse(body);
      var name = post.name;
      var description = post.description;
      fs.writeFile(`description/${name}`, description, 'utf8', 
      function(err){
        response.writeHead(302, {Location: `/?id=${name}`});
        response.end();
      })
    });
    

  }else {
    response.writeHead(404);
    response.end("Not found");
  }
});
app.listen(3000);
