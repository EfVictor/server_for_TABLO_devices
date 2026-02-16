// Hiding elements from the start
tablo.style.display='none'
but2.style.display='none'
but3.style.display='none'
but4.style.display='none'

StopService() // Initial service stop

// Search TABLO device on the net
function StartService(){
	but1.style.display='none'
	but2.style.display=''
	but3.style.display='none'
	but4.style.display='none'
	message.textContent = "";
	tablo.style.display='none'

	fetch(StartService_URL)
	.then(function(response){  
		response.text().then(function(data) { 		
			message.textContent = data;				
		})
	 })
}

// Stopping search TABLO device on the net
function StopService(){
	tablo.style.display=''
	tablo.innerHTML = "<table id='tablo'><tr><td align='center' class='TDALL'>IP</td><td align='center' class='TDALL'>MAC</td><td align='center' class='TDALL'>KAB</td><td align='center' class='TDALL'>ПУТЬ к MEDKABINET.json</td><td align='center' class='TDALL'>ПУТЬ к PATIENT.json</td><td align='center' class='TDALL'>Данные (для теста)</td></tr>";
	but1.style.display=''
	but2.style.display='none'
	but3.style.display=''
	but4.style.display=''
	message.textContent = "";

	fetch(StopService_URL)
	.then(function(response){  
		response.json().then(function(data) { 		
			message.textContent = "UDP сервер остановлен";					
			for (var i in data) {
				let mac = data[i].split(',')[0].slice(4)
				let ip = data[i].split(',')[1].slice(4)
				tablo.innerHTML += '<tr><td class="TDALL" id="ip'+ i + '">'+ ip +'</td><td class="TDALL" id="mac'+ i + '">'+ mac +'</td><td class="TDALL" ><input type="text" id="kab'+ i + '"></td><td class="TDALL" ><input type="text" id="jsonMEDKABINET'+ i + '"></td><td class="TDALL" ><input type="text" id="jsonPATIENT'+ i + '"></td><td class="TDALL"><input type="text" id="datatest'+ i + '"></td><td align="right" class="TDALL"><button onclick="SendTablo('+i+');">Отправить данные на устройство</button></td></tr>'
			}				 
		})
	 })
	.catch(error => { message.textContent = "Сервис для работы с табло не запущен!";})	
}

// Writing data to a file info_tablo_all_kab.json
function WriteJson(){
	let DATAtoJSON = "";
	for (let i = 0; i < document.getElementsByTagName("input").length/4; i++)
		DATAtoJSON += '{"MAC":"' +  document.getElementById("mac"+i).textContent +
					  '","IP":"' +  document.getElementById("ip"+i).textContent + 
					  '","KAB":"' + document.getElementById("kab"+i).value + 
					  '","medkabinet.json":"' + document.getElementById("jsonMEDKABINET"+i).value + 
					  '","patient.json":"' + document.getElementById("jsonPATIENT"+i).value + '"},'

	fetch(WriteJSON_URL+"?DATAtoJSON=" + DATAtoJSON)
	.then(function(response){  
		response.text().then(function(data) { 		
			message.textContent = data;				
		})
	 })
}

// Sending data to the TABLO device
function SendTablo(num){
	fetch(SendData_URL+"?IP_Tablo=" + document.getElementById("ip"+num).textContent +"&DATA=" + document.getElementById("datatest"+num).value)
	.then(function(response){  
		response.text().then(function(data) { 		
			message.textContent = data;				
		})
	 })
}

// Updating data about the number on all TABLO device from the json queue
function UpdateTablo(){
	fetch(UpdateData_URL)
	.then(function(response){  
		response.text().then(function(data) { 		
			message.textContent = data;				
		})
	 })
}