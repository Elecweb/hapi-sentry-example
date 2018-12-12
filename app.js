"use strict";

const Hapi = require("hapi");
const pkg = require("./package.json");
require("dotenv").config();

const setup = async () => {
  const server = Hapi.server({
    port: 3000,
    host: "localhost"
  });

  const options = {
    client: {
      release: pkg.name + "@" + pkg.version,
      dsn: process.env.dsn,
      environment: process.env.SERVER
    }
  };

  await server.register({ plugin: require("hapi-sentry"), options });

  server.route({
    method: "GET",
    path: "/",
    handler: (request, h) => {
      return "Hello, world!";
    }
  });

  server.route({
    method: "POST",
    path: "/{name}",
    handler: (request, h) => {
      const name = request.params.name;
      if (name === "error") {
        request.sentryScope.setExtra(
          "useful-information",
          "this is intend mistake :P"
        );
        throw Error("error has founded!!!!");
      }
      return "Hello, " + encodeURIComponent(name) + "!";
    }
  });

  const init = async () => {
    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
  };

  process.on("unhandledRejection", err => {
    console.log(err);
    process.exit(1);
  });

  init();
};

setup();
