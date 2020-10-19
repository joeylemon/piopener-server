# piopener-server

### What is it?

Our project, titled piopener, is the infrastructure designed to allow us to communicate with our garage door via our API and perform actions upon it. These actions can be opening, closing, checking history, checking current open status, etc.

### Why?

After continuously losing, forgetting, or otherwise destroying our garage door openers, my roommate and I decided it would be a fun idea to reverse-engineer our garage door and allow us to do whatever we wanted with it.

### How?

We soldered two wires from the Raspberry Pi to the circuit board inside of one of our garage door openers, allowing us to send a signal programatically to the door opener. This allows us to set up the endpoint for opening and closing the garage door. In order to check of the status of the door (opened or closed), we wired one magnetic reed switch to the Pi and one to the garage door, allowing us to check if the door is closed if the switches are connected.

### What is piopener-server?

This repository is the code that lives on a dedicated server which serves as the dedicated backend to the piopener project. It includes every endpoint required to operate the piopener project, including opening and closing, checking status, checking history, changing user settings, etc. In order to actually open the garage, this server can send a request to the [Raspberry Pi](https://github.com/joeylemon/piopener-pi)'s ip address. The [iOS application](https://github.com/joeylemon/piopener-app) serves as the main interface to this server.

#### Technologies:
- Node.js: host a web server which handles all requests to administrate the piopener project
- MySQL: store the open and close history of the garage door, all of the users, and all of the users' settings
