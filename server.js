const app = require("./app");
const mongoose = require("mongoose");

//enable if need mongoose debugging
//mongoose.set("debug", true);

//mongoose connection
mongoose
  .connect(
    process.env.DATABASE,
    {
      useNewUrlParser: true,
    }
  )
  .then((result) => {
    console.log("DB connection successful! ");
  });

app.listen(process.env.PORT || 3000);
