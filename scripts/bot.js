require("../src/nlp");

module.exports = (robot) => {
  function listenIntent(intent, response) {
    robot.listen((message) => {
      // console.log(message)
      if (message.intent && message.intent.name === intent) {
        return message.__natural;
      }
      return false;
    }, response);
  }

  robot.receiveMiddleware((context, next, done) => {
    const text = context.response.message.text;
    if (text && text.match(robot.respondPattern(""))) {
      const replacedStr = text.replace(robot.respondPattern(""), "");
      // manager.process("en", replacedStr).then((res) => console.log(res));
      robot
        .http(`https://api.wit.ai/message?v=20201019&q=${replacedStr}`)
        .header("Content-Type", "application/json")
        .header("Authorization", `Bearer ${WIT_AI_TOKEN}`)
        .get()((err, response, body) => {
        if (err) {
          context.response.reply("I had a problem with my brain things");
          done();
        }

        const nats = JSON.parse(body);
        const intents = nats.intents.filter(
          (intent) => intent.confidence > 0.7
        );

        if (intents.length > 1) {
          context.response.reply(
            "Sorry, I couldn't understand what you were asking"
          );
          context.response.message.finish();
        }

        if (intents.length === 1) {
          // console.log(`Intent: ${intents[0].name}`);
          context.response.message.intent = intents[0];
          context.response.message.__natural = nats;
        }

        next();
      });
    }
    next();
  });

  robot.hear(/badger/i, (res) =>
    res.send("Badgers? BADGERS? WE DON'T NEED NO STINKIN BADGERS")
  );
  robot.hear(/noah/i, (res) => res.send("Noah is a hosebeast"));

  robot.respond(/hello/i, (res) => res.send("Howdy"));

  // robot.send(/log/i, (res) => console.log(res));

  listenIntent("deployment_create", (res) => {
    // console.log(res.match.entities);

    // first thing first validate entities
    // need a project, tenant and environment
    const environments = res.match.entities["environment:environment"];
    const projects = res.match.entities["project:project"];
    const tenants = res.match.entities["tenant:tenant"];

    const results = [];
    if (!environments) {
      results.push("Missing Evironment: ex staging, prod, uat");
    }
    if (!tenants) {
      results.push("Missing Partners: ex bbva, td");
    }
    if (!projects) {
      results.push("Missing Projects: ex complaints, disputes");
    }
    if (results.length > 0) {
      res.reply(results.join("\n"));
    } else {
      res.reply(`
      Deploying
        Projects: [${projects.map((proj) => proj.value).join(", ")}]
        Partners: [${tenants.map((tenant) => tenant.value).join(", ")}]
        Environments: [${environments.map((env) => env.value).join(", ")}]
    `);
    }
  });

  listenIntent("project_check", (res) => {
    // console.log(res.match.entities);
  });
};
