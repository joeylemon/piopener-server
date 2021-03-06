# piopener-server

![Node.js Tests](https://github.com/joeylemon/piopener-server/workflows/Node.js%20Tests/badge.svg)

### What is it?

Our project, titled piopener, is the infrastructure designed to allow us to communicate with our garage door via our API and perform actions upon it. These actions can be opening, closing, checking history, checking current open status, etc.

#### Repositories of piopener

- [piopener-server](https://github.com/joeylemon/piopener-server): Node.js backend
- [piopener-pi](https://github.com/joeylemon/piopener-pi): Raspberry Pi & Node.js client
- [piopener-app](https://github.com/joeylemon/piopener-app): Swift & storyboards iOS frontend

### Why?

After continuously losing, forgetting, or otherwise destroying our garage door openers, my roommate and I decided it would be a fun idea to reverse-engineer our garage door and allow us to do whatever we wanted with it.

### How?

To set up the endpoint for opening and closing the garage door, we simply connected wires from the Raspberry Pi to the circuit board inside of one of our broken garage door remotes. To determine whether the garage was opened or closed, we placed one magnetic reed switch at the beginning of the garage door frame and another at the end of the frame, with a magnet taped to the door's moving chain. When the moving magnet connects with one of the reed switches, the circuit is closed and we know what state the garage door is in.

### What is piopener-server?

This repository is the code that lives on a dedicated server which serves as the backend to the piopener project. It includes every endpoint required to operate the piopener project, including opening and closing, checking status, checking history, changing user settings, etc. In order to actually open the garage, this server can send a request to the [Raspberry Pi](https://github.com/joeylemon/piopener-pi) via a websocket connection. The [iOS application](https://github.com/joeylemon/piopener-app) serves as the main interface to this server.

#### Technologies:
- Node.js: host a web server which handles all requests to administrate the piopener project
- Socket.io: maintain real-time communication with [piopener-pi](https://github.com/joeylemon/piopener-pi) to interact with the garage door
- MySQL: store the open and close history of the garage door, all of the users, and all of the users' settings
