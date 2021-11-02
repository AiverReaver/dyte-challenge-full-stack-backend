import "reflect-metadata";
import { createConnection } from "typeorm";
import { createServer } from "./utils/server";


createConnection()
  .then(() => createServer())
  .then(app => {
    const PORT = Number(process.env.PORT) || 3000
    app.listen(PORT);

    console.log(`Express server has started on port ${PORT}`);
  }).catch(error => console.log(error));
