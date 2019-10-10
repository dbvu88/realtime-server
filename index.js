const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")();

const cors = require("cors");

const r = require("rethinkdb");
const {
  createDrawing,
  subscribeToDrawings,
  handleLinePublish
} = require("./models/drawings");
app.use(cors());

r.connect({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 28015,
  db: process.env.DB_NAME || "awesome_whiteboard"
}).then(connection => {
  io.on("connection", client => {
    // on() - subscribe to events
    client.on("subscribeToTimer", interval => {
      console.log("client is subscribing to timer with interval ", interval);
      // listen to the changes in the timers table
      r.table("timers")
        .changes()
        .run(connection)
        .then(cursor => {
          cursor.each((err, timerRow) => {
            if (err) {
              console.log(err);
              return;
            }
            client.emit("timer", timerRow.new_val.timestamp);
          });
        });

      //   setInterval(() => {
      //     // emit() - publish events
      //     client.emit("timer", new Date());
      //   }, interval);
    });

    client.on("createDrawing", ({ name }) =>
      createDrawing({ connection, name })
    );

    client.on("subscribeToDrawings", () =>
      subscribeToDrawings({
        client,
        connection
      })
    );

    client.on("publishLine", line => handleLinePublish({ connection, line }));
  });
});

app.get("/", (req, res) => {
  res.send("hello");
});

const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
  console.log("listening on port ", port);
});

io.listen(server);
