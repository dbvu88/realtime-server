const io = require("socket.io")();

io.on("connection", client => {
  // on() - subscribe to events
  client.on("subscribeToTimer", interval => {
    console.log("client is subscribing to timer with interval ", interval);
    setInterval(() => {
      // emit() - publish events
      client.emit("timer", new Date());
    }, interval);
  });
});

const port = 8000;
io.listen(8000);
console.log("listening on port ", port);
