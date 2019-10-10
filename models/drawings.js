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
  const { drawingId } = lines;
  r.table("liners")
    .contains(line => {
      return line("drawingId").eq(drawingId);
    })
    .run(connection)
    .then(rowFound => {
      // console.log(rowFound);
      if (rowFound) {
        lines.timestamp = new Date();

        r.table("liners")
          .filter({ drawingId })
          .update(lines)
          .run(connection);
      } else {
        r.table("liners")
          .insert({ ...lines, timestamp: new Date() })
          .run(connection);
      }
    });
};

module.exports = {
  createDrawing,
  subscribeToDrawings,
  handleLinePublish
};
