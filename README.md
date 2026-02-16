# server_for_TABLO_devices

Node js server and web page for setting up TABLO devices in the network and interacting with them to call a patient from the queue for an appointment with a doctor. 

This project implements the configuration of TABLO devices in the network, which periodically send a UDP request to the network about their readiness for operation.

These devices do not have a static IP binding, so the server writes the MAC - IP binding to the __info_tablo.txt__ file.  
The server can also write data for the binding of cabinets and TABLO devices to the __info_tablo_all_kab.json__ file and send data for display to a specific device or to all at once

For ease of configuration, the user has a web page __tablo_settings.htm__

--------
### Project structure:

1. node - server for interactions with TABLO devices:
	* node_tablo.js -  Node.js server
	* launch_node_tablo.bat - bat file for starting the server
	* info_tablo.txt - file for linking the MAC address of the device with its IP on the network
	* info_tablo_all_kab.json - file for linking the device with the cabinets and queues working in them
  
1. tablo_settings.htm - page for setting up and working with TABLO devices
1. config.js - file for configuration
1. request.js - file with the main logic for interaction with the web server
