const r = require("rethinkdb");

const createDrawing = ({ connection, name }) => {
  r.table("drawings")
    .insert({
      name,
      timestamp: new Date()
    })
    .run(connection)
    .then(() => console.log("created a drawing with name: ", name));
};

const subscribeToDrawings = ({ client, connection }) => {
  r.table("drawings")
    .changes({ includeInitial: true })
    .run(connection)
    .then(cursor => {
      cursor.each((err, drawingRow) => {
        // console.log(drawingRow);
        client.emit("drawing", drawingRow.new_val);
      });
    });
};

const handleLinePublish = ({ connection, lines }) => {
  // console.log("saving line to db");
  // console.log(lines);
  r.table("lines")
    .insert({ ...lines, timestamp: new Date() })
    .run(connection);
};

module.exports = {
  createDrawing,
  subscribeToDrawings,
  handleLinePublish
};
