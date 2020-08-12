# piopener-server

### What is it?

Our project, titled piopener, is the infrastructure designed to allow us to communicate with our garage door via our API and perform actions upon it. These actions can be opening, closing, checking history, checking current open status, etc.

### Why?

After continuously losing, forgetting, or otherwise destroying our garage door openers, my roommate and I decided it would be a fun idea to reverse-engineer our garage door and allow us to do whatever we wanted with it.

### How?

During the aforementioned destruction of a garage door opener, I noticed the circuit board inside was extremely simple: a single battery and two buttons with lots of space for soldering. So, after investing in a soldering iron, we went to work on attempting to wire up a circuit between the Raspberry Pi and the opener circuit. A very short amount of time later (or maybe a few hours since we've never soldered before), we had a working circuit in which we could send a signal from the Raspberry Pi to the garage door opener to open the garage.

This only solved how to open the garage door programatically, we still needed a way to see if the door was currently open or closed. We decided to buy a few magnetic reed switches and mount them on the garage door and its frame. So, when the door opens, the circuit closes and we know the door is open.

### What is piopener-server?

This repository is the code that lives on the Raspberry Pi which is wired up to the garage door opener. We have another [Raspberry Pi](https://github.com/joeylemon/piopener) in the garage wired to the reed switches; this Pi sends requests to the other Pi to get the open status of the garage. Additionally, the [iOS application](https://github.com/joeylemon/piopener-app) serves as an interface to this server.

#### Technologies:
- Node.js: this Pi hosts a web server which receives requests for performing operations on the garage
- MySQL: the Pi also stores the open and close history of the garage door, tying each event to a user
- Raspberry Pi GPIO: the interface to the GPIO pins on the Pi allows the Node.js server to send electrical signals to the opener circuit board
