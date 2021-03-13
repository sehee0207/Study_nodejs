var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');

var template = {
HTML:function(title, list, body, control){
  return `
  <!doctype html>
  <html>
  <head>
    <title>WEB1 - ${title}</title>
    <meta charset="utf-8">
  </head>
  <body>
    <h1><a href="/">WEB</a></h1>
    ${list}
    ${control}
    ${body}
  </body>
  </html>
    `;
  },list:function(filelist){
  var list = '<ul>';
    var i = 0;
    while(i < filelist.length){
      list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
      i++;
    }
  list = list+'</ul>';
  return list;
  }
}

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    if(pathname === '/'){
      if(queryData.id === undefined){
        fs.readdir('./data', function(error, filelist){
          var title = 'Welcome';
          var description = 'Hello, Node.js';
          var list = template.list(filelist);
          var html = template.HTML(title, list,
            `<h2>${title}</h2>${description}`, 
            `<a href="/create">create</a>`
          );
          response.writeHead(200);
          response.end(html);
        })
      } else{
        fs.readdir('./data', function(error, filelist){
          fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description){
          var title = queryData.id;
          var list = template.list(filelist);
          var html = template.HTML(title, list,
              `<h2>${title}</h2>${description}`, 
              `<a href="/create">create</a>
              <a href="/update?id=${title}">update</a>
              <form action="delete_process" method="post">
                <input type="hidden" name="id" value="${title}">
                <input type="submit" value="delete">
              </form>`
            );
            response.writeHead(200);
            response.end(html);
          });
        });
      }
    } else if(pathname === '/create'){
      fs.readdir('./data', function(error, filelist){
        var title = 'WEB - create';
        var list = template.list(filelist);
        var html = template.HTML(title, list, `
            <form action="/create_process" method="post">
            <p><input type="text" placeholder="title" name="title"></p>
            <p>
              <textarea placeholder="description" name="description"></textarea>
            </p>
            <p>
              <input type="submit"></input>
            </p>
            </form>
          `, '');
            response.writeHead(200);
            response.end(template);
        });
      } else if(pathname === '/create_process'){
        var body = '';
        request.on('data', function(data){
          // post 방식으로 전송 할 때 한 번에 처리를 하기엔 여러 무리가 생길 수 있음
          // 데이터가 많을 경우를 대비하여 조각 조각의 양을 수신 할 때 마다 콜백 함수를 호출 하도록 약속
          // 호출 시 데이터 라는 인자를 통해 수신한 정보를 주기로 약속
          body = body + data; // body 데이터에 콜백이 실행 될 때 마다 data 실행
        });
        request.on('end', function(){
          var post = qs.parse(body);
          var title = post.title;
          var description = post.description;
          fs.writeFile(`data/${title}`, description, 'utf8', function(err){
            response.writeHead(302, {Location: `/?id=${title}`}); // 페이지를 다른 곳으로 리다이랙션
            response.end();
          })
        });
      } else if(pathname === '/update'){
        fs.readdir('./data', function(error, filelist){
          fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description){
          var title = queryData.id;
          var list = template.list(filelist);
          var html = template.HTML(title, list,
              `
              <form action="/update_process" method="post">
              <input type="hidden" name="id" value="${title}" >
            <p><input type="text" placeholder="title" name="title" value="${title}"></p>
            <p>
              <textarea placeholder="description" name="description">${description}</textarea>
            </p>
            <p>
              <input type="submit">
            </p>
            </form>
              `, 
              `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
            );
            response.writeHead(200);
            response.end(html);
          });
        });
      } else if(pathname==='/update_process'){
        var body = '';
        request.on('data', function(data){
          body = body + data;
        });
        request.on('end', function(){
          var post = qs.parse(body);
          var id = post.id;
          var title = post.title;
          var description = post.description;
            fs.rename(`data/${id}`, `data/${title}`, function(error){
              fs.writeFile(`data/${title}`, description, 'utf8', function(err){
              response.writeHead(302, {Location: `/?id=${title}`}); // 페이지를 다른 곳으로 리다이랙션
              response.end();
            })
          });
        });
      } else if(pathname==='/delete_process'){
          var body = '';
          request.on('data', function(data){
            body = body + data;
          });
          request.on('end', function(){
            var post = qs.parse(body);
            var id = post.id;
            fs.unlink(`data/${id}`, function(error){
              response.writeHead(302, {Location: `/`}); // 페이지를 다른 곳으로 리다이랙션
              response.end();
            })
          });
      } else{
        response.writeHead(404);
        response.end('Not found');
      }
  });
  app.listen(3000);