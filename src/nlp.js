const { dockStart } = require("@nlpjs/basic");

(async () => {
  try {
    const dock = await dockStart();
    console.log(dock);
    const nlp = dock.get("nlp");
    // await nlp.addCorpus("../corpus-en.json");
    await nlp.train();
    const response = await nlp.process("en", "deploy complaints to prod");
    console.log(response);

    return nlp;
  } catch (err) {
    console.log(err);
  }
})();
