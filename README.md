# piopener-server

### What is it?

Our project, titled piopener, is the infrastructure designed to allow us to communicate with our garage door via our API and perform actions upon it. These actions can be opening, closing, checking history, checking current open status, etc.

### Why?

After continuously losing, forgetting, or otherwise destroying our garage door openers, my roommate and I decided it would be a fun idea to reverse-engineer our garage door and allow us to do whatever we wanted with it.

### How?

We soldered two wires from the Raspberry Pi to the circuit board inside of one of our garage door openers, allowing us to send a signal programatically to the door opener. This allows us to set up the endpoint for opening and closing the garage door. In order to check of the status of the door (opened or closed), we wired one magnetic reed switch to the Pi and one to the garage door, allowing us to check if the door is closed if the switches are connected.

### What is piopener-server?

This repository is the code that lives on the Raspberry Pi which is wired up to the garage door opener. We have another [Raspberry Pi](https://github.com/joeylemon/piopener) in the garage wired to the reed switches; this Pi sends requests to the other Pi to get the open status of the garage. Additionally, the [iOS application](https://github.com/joeylemon/piopener-app) serves as an interface to this server.

#### Technologies:
- Node.js: this Pi hosts a web server which receives requests for performing operations on the garage
- MySQL: the Pi also stores the open and close history of the garage door, tying each event to a user
- Raspberry Pi GPIO: the interface to the GPIO pins on the Pi allows the Node.js server to send electrical signals to the opener circuit board
