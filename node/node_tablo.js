// Working with UDP
const dgram = require('dgram');
var server;

// Working with the file system
const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors())
const fs = require("fs");

// Working with Socket
var net = require('net'),
JsonSocket = require('json-socket');

// Declaring variables
const PORT_server_JSON = 4998;   // port to run this web server
const PORT_server_Listen = 4999;   // port of the TABLO device where it sends responses
const PORT_server_Send = 5000;   // port of the TABLO device where it gets responses
var responsetablo = "";
var tablo = [];
var kab = "";
var ip = "";
var path_medkabinet = "";
var path_nextpatient = "";
var CodeMed = "";
var Nomer = "";
var responseHTM = "";
var socket;  

// Start UDP
app.get('/START', (req, res) => {
	fs.writeFile("info_tablo.txt", '', function(error){ // Initial file cleanup info_tablo.txt
    if(error) return console.log(error);  
    // console.log('File info_tablo.txt is empty and ready to be written\n'); // Debug log
	});
	
	server = dgram.createSocket('udp4');
	
	server.on('listening', () => {
	const address = server.address();
	// console.log(`UDP server listening on ${address.address}:${address.port}`); // Debug log
	});	
	
	server.on('error', (err) => {
	console.log(`server error:\n${err.stack}`);
	server.close();
	});
		
	server.on('message', (msg, rinfo) => {

    // Recording data about the TABLO device into the file
    let log = msg.toString();
    let mac = log.split('"mac"');
	let data = "";
	data += "MAC:" + mac[1].slice(2,19) + ", IP:" + rinfo.address + "\n";
	fs.appendFile("info_tablo.txt", data, function(error){
		if(error) return console.log(error);      
    // console.log('File info_tablo.txt is updated!'); // Debug log
	});	
	});
	
	server.bind(PORT_server_Listen);  //Start the service to listen to the request from TABLO
	res.send(`UDP сервер запущен, поиск устройств в сети начат. Остановите сервис, чтобы отобразить информацию на экран`);
	
});

// Stop UDP
app.get('/STOP', (req, res) => {
	server.close();
		
	// Reading data from a file
	fs.readFile("info_tablo.txt", function(error,data){
    if(error) {  
        return console.log(error);
    }
	responsetablo = data.toString()
	let responsetablo_1 = responsetablo.split('\n')
	tablo.push(responsetablo_1[0])
	for (let j = 0; j < tablo.lenght; j++)
	for (let i = 0; i < responsetablo_1.lenght; i++) { 
		if(responsetablo_1[i] != tablo[j])
			tablo.push(responsetablo_1[i])
	}	 
	});
	
	res.send(tablo);
	tablo.length = 0;	
});

// Recording of connections between the cabinet and TABLO device"."
app.get('/WRITE', (req, res) => {
	fs.writeFile("info_tablo_all_kab.json", '{"Tablo":[', function(error){ //Initial file cleanup info_tablo_all_kab.json
    if(error) return console.log(error);
    // console.log('File info_tablo.txt is empty and ready to be written\n'); // Debug log
	});

    // Writing to file info_tablo_all_kab.json	
	fs.appendFile("info_tablo_all_kab.json", req.query.DATAtoJSON.substring(0, req.query.DATAtoJSON.length - 1) + ']}', function(error){
		if(error) return console.log(error);      
    // console.log('File info_tablo.txt is updated!'); // Debug log
	});	
	res.send("Данные записаны в файл info_tablo_all_kab.json") 
});

// Sending data to the TABLO device
app.get('/SEND', (req, res) => {
	socket = new JsonSocket(new net.Socket()); 
	socket.connect(PORT_server_Send, req.query.IP_Tablo);
	socket.on('connect', function() { 
    socket.sendMessage({"did": 1,"command": "print","data":{"blink_time": 5,"ticket_font": 2,"text": req.query.DATA}});
	});	
	res.send('На табло ' + req.query.IP_Tablo + ' был отправлен номер ' + req.query.DATA)
});

// Updating data on the TABLO device
app.get('/UPDATE', (req, res) => {
	responseHTM = "";

	// Reading data from a file
	fs.readFile("info_tablo_all_kab.json", function(error,data){ 
    if(error)  return console.log(error);
	let resp = JSON.parse(data.toString());
	for (let i = 0; i < resp.Tablo.length; i++) { 
		kab = resp.Tablo[i].KAB
		ip = resp.Tablo[i].IP
		path_medkabinet = resp.Tablo[i]["medkabinet.json"]
		path_nextpatient = resp.Tablo[i]["patient.json"]
		
		fs.readFile("../json/" + path_medkabinet, function(error,data2){
		if(error) {  
        return console.log(error);
		}
		let resp2 = JSON.parse(data2.toString());

		for (let j = 0; j < resp2.ListMedKabinet.length; j++) { 
			if (resp2.ListMedKabinet[j].Kab == kab){
				CodeMed = resp2.ListMedKabinet[j].CodeMed
				fs.readFile("../json/" + path_nextpatient, function(error,data3){
				if(error) {  
					return console.log(error);
				}
				let resp3 = JSON.parse(data3.toString());
		
				for (let c = 0; c < resp3.ListNextPatient.length; c++) { 
					if (resp3.ListNextPatient[c].CodeMed == CodeMed){
						// responseHTM += 'В кабинет ' + kab + ' приглашается пациент ' + Nomer + '\n'
						Nomer = resp3.ListNextPatient[c].Nomer
						socket = new JsonSocket(new net.Socket());
						socket.connect(PORT_server_Send, ip);
						socket.on('connect', function() { 
						socket.sendMessage({"did": 1,"command": "print","data":{"blink_time": 5,"ticket_font": 2,"text": Nomer}});
						});	
					}
				}	 
				});
				
			}
		}	 
		});
	}	 
	});	
	res.send('Данные на всех табло обновлены!')
});

// Empty request
app.use((req, res, next) => {
  res.send("Сервис для для настройки светодиодных табло для вызова пациента работает, но не понимает отправленный запрос! 4998 порт для работы с JSON файлом; 4999 UDP порт для получения информации об устрйоствах ТАБЛО в сети; 5000 SOCKET порт для отправки данных на ТАБЛО.")
});

app.listen(PORT_server_JSON); // Launching a server