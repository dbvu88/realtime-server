const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.get("/", (req, res) => {
  res.send("hello");
});

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

const port = process.env.PORT || 8000;
http.listen(port, () => {
  console.log("listening on port ", port);
});
