UID=piopener

run:
	node main.js

# Run the server forever, listening for file changes and restarting accordingly
forever:
	forever start --uid=$(UID) --append -w main.js

stop:
	forever stop $(UID)