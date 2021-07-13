const mongoose = require("mongoose");

const { Schema } = mongoose;
const commentSchema = new Schema({
  nickname: {
    type: String,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
  maked_date: {
    type: Date,
    required: true,
  },
  writings_id: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("comments", commentSchema);
