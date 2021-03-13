var express = require('express');
var app = express();
var http = require('http').Server(app); 
var io = require('socket.io')(http);    
var path = require('path');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {  
	res.render('main', { title: '온라인 빙고 게임', username: req.query.username });
});

var users = {};
var user_count = 0;
var turn_count = 0;


io.on('connection', function(socket){ // 소켓이 연결 되었을 때 발생하는 이벤트
	
	console.log('user connected : ', socket.id);
	
	socket.on('join', function (data) { // 사용자 접속 시
		var username = data.username;
		socket.username = username;
		
        // 사용자의 이름을 가져와서 사용자 일므으로 설정하고 객체를 살정해 이름과 턴값을 설정
        // 클라이언트에게 새로운 사용자가 접속 했으니 목록을 업데이트 해 출력하라고 이벤트를 전송하여 알려줌
		users[user_count] = {};
		users[user_count].id = socket.id;
		users[user_count].name = username;
		users[user_count].turn = false;
		user_count++;
		
		io.emit('update_users', users, user_count);
	});
	
	socket.on('game_start', function (data) { // 아래쪽 게임 시작 버튼
		socket.broadcast.emit("game_started", data); // 모든 사용자에게 게임 시작을 알림
		users[turn_count].turn = true;
		
		io.emit('update_users', users);
	});
	
	socket.on('select', function (data) { // 숫자 선택 시 발생
		socket.broadcast.emit("check_number", data);
		
		users[turn_count].turn = false;
		turn_count++;
		
		if(turn_count >= user_count) {
			turn_count = 0;
		}
		users[turn_count].turn = true;
		
		io.sockets.emit('update_users', users); // 다음 사용자의 순서를 알려주기 위해
	});
	
	socket.on('disconnect', function() { // 사용자가 접속 종료시
		console.log('user disconnected : ', socket.id, socket.username);
		for(var i=0; i<user_count; i++){ // 배열에서 현재 소켓의 아이디와 같은 값을 가진 사용자를 삭제, user count 감소
			if(users[i].id == socket.id)
				delete users[i];
		}	
		
		user_count--;
		io.emit('update_users', users, user_count); // 사용자가 나가면 상대방도 알 수 있도록 유저 리스트 업데이트
	});
});

http.listen(3000, function(){ 
	console.log('server on!');
});
