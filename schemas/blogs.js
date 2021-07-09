const mongoose = require("mongoose");

const { Schema } = mongoose;
    const blogSchema = new Schema({
      title: {
        type: String,
        required: true,
      },
      contents: {
        type: String,
        required: true,
      },
      nickname: {
        type: String,
        required: true,
      },
      kind: {
        type: String,
        required: true,
      },
      maked_date: {
        type: Date,
        required: true,
      },
    });

module.exports = mongoose.model("blogs", blogSchema);