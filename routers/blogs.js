const express = require("express");
const Joi = require("joi");
const Blogs = require("../schemas/blogs");
const User = require("../schemas/user");
const Comments = require("../schemas/comments");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares/auth-middleware");

const router = express.Router();

const joiSchema = Joi.object({
  nickname: Joi.string().min(3).pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
  email: Joi.string(),
  password: Joi.string().min(4),
  confirmPassword: Joi.ref("password"),
});

router.get("/home", async (req, res, next) => {
  try {
    let { kind } = req.query;
    let blogs = await Blogs.find({ kind }).sort({ maked_date: -1 });
    res.json({ blogs: blogs });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

router.get("/writings", async (req, res, next) => {
  let { _id } = req.query;
  let blogs = await Blogs.find({ _id });
  let comments = await Comments.find({}).sort({ maked_date: -1 });
  res.json({ blogs: blogs, comments: comments });
});

router.get("/writings_login", authMiddleware, async (req, res, next) => {
  let { _id } = req.query;
  let { nickname } = res.locals.user;
  let blogs = await Blogs.find({ _id });
  let comments = await Comments.find({}).sort({ maked_date: -1 });
  res.json({ blogs: blogs, comments: comments, nickname: nickname });
});

router.get("/modification", authMiddleware, async (req, res, next) => {
  let { nickname } = res.locals.user;

  res.send({ result: nickname });
});

router.post("/write", authMiddleware, async (req, res) => {
  let { title, contents, kind } = req.body; // req.body 이후에 [] 인자가 없으므로 키값과 변수명이 같다고 보므로 변수명을 통일시켜야 함. 변수명을 맘대로 지어서 값이 들어가지 않았다.
  let { nickname } = res.locals.user;
  // isExist = await Blogs.find({ contents }); if (isExist.length == 0) {
  let date = new Date(); // 현재 시간을 불러와주는 인스턴스를 받는 변수 선언
  let maked_date = date; // maked_date가 필요하기 때문에 date만 안쓰고 maked_date를 선언하고 date를 넣어준다

  await Blogs.create({
    title,
    contents,
    kind,
    nickname,
    maked_date,
  }); // 위에서 바디로 받아온 변수들이 다 들어있어야 함
  // }

  res.send({ result: "success" });
});

router.post("/auth", async (req, res) => {
  const { nickname, password } = req.body;
  const user = await User.findOne({
    $and: [{ nickname: nickname }, { password: password }],
  });

  if (!user) {
    res.status(400).send({
      errorMessage: "닉네임 또는 패스워드를 확인해주세요",
    });
    return;
  }

  const token = jwt.sign({ nickname: user.nickname }, "my-secret-key");
  res.send({
    token,
  });
});

router.post("/users", async (req, res) => {
  try {
    const { nickname, email, password, confirmPassword } =
      await joiSchema.validateAsync(req.body);

    if (password !== confirmPassword) {
      res.status(400).send({
        errorMessage: "패스워드가 패스워드 확인란과 동일하지 않습니다.",
      });
      return;
    }

    if (password == nickname) {
      res.status(400).send({
        errorMessage: "닉네임과 패스워드는 달라야 합니다.",
      });
      return;
    }

    const existUsers = await User.find({ nickname: nickname });

    if (existUsers.length) {
      res.status(400).send({
        errorMessage: "중복된 닉네임입니다.",
      });
      return;
    }

    await User.create({ email, nickname, password });

    res.status(201).send({});
  } catch (err) {
    res.status(400).send({
      errorMessage: "요청한 데이터 형식이 올바르지 않습니다.",
    });
  }
});

//  커멘트 작성 api******************************************************************************************
router.post("/comment", authMiddleware, async (req, res) => {
  let { comment } = req.body; // req.body 이후에 [] 인자가 없으므로 키값과 변수명이 같다고 보므로 변수명을 통일시켜야 함. 변수명을 맘대로 지어서 값이 들어가지 않았다.
  let { nickname } = res.locals.user;
  let date = new Date(); // 현재 시간을 불러와주는 인스턴스를 받는 변수 선언
  let maked_date = date; // maked_date가 필요하기 때문에 date만 안쓰고 maked_date를 선언하고 date를 넣어준다

  if (comment == "") {
    res.send({ result: "error" });
    return;
  }

  await Comments.create({
    nickname,
    comment,
    maked_date,
  });

  res.send({ result: "success" });
});

router.patch("/update", async (req, res) => {
  let { _id } = req.query;
  let { title, contents, kind } = req.body; // req.body 이후에 [] 인자가 없으므로 키값과 변수명이 같다고 보므로 변수명을 통일시켜야 함. 변수명을 맘대로 지어서 값이 들어가지 않았다.

  // isExist = await Blogs.find({ contents }); if (isExist.length == 0) {
  let date = new Date(); // 현재 시간을 불러와주는 인스턴스를 받는 변수 선언
  maked_date = date; // maked_date가 필요하기 때문에 date만 안쓰고 maked_date를 선언하고 date를 넣어준다
  await Blogs.updateOne(
    { _id: _id },
    {
      $set: {
        title: title,
        contents: contents,
        kind: kind,
        maked_date: maked_date,
      },
    }
  );

  res.send({ result: "success" });
});

router.patch("/update_comment", async (req, res) => {
  let { _id } = req.query;
  let { comment_modification } = req.body; // req.body 이후에 [] 인자가 없으므로 키값과 변수명이 같다고 보므로 변수명을 통일시켜야 함. 변수명을 맘대로 지어서 값이 들어가지 않았다.

  // isExist = await Blogs.find({ contents }); if (isExist.length == 0) {
  let date = new Date(); // 현재 시간을 불러와주는 인스턴스를 받는 변수 선언
  maked_date = date; // maked_date가 필요하기 때문에 date만 안쓰고 maked_date를 선언하고 date를 넣어준다
  await Comments.updateOne(
    { _id: _id },
    {
      $set: {
        comment: comment_modification,
        maked_date: maked_date,
      },
    }
  );

  res.send({ result: "success" });
});

router.delete("/delete", async (req, res) => {
  let { _id } = req.query;

  await Blogs.deleteOne({ _id: _id });

  res.send({ result: "success" });
});

router.delete("/delete_comment", async (req, res) => {
  let { _id } = req.query;

  await Comments.deleteOne({ _id: _id });

  res.send({ result: "success" });
});

module.exports = router;
