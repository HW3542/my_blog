const express = require("express");
const app = express();
const port = 3000;
const blogsRouter = require("./routers/blogs");

const connect = require("./schemas");
connect();

app.use(express.static("static")); // 정적인 파일을 제공하기 위한 역할을 함

app.use("/api", express.urlencoded({ extended: false }), blogsRouter); // 미들웨어를 쓸 준비. url 외에 추가적인 정보를 전달하기 위함. POST의 body 정보 등.
app.use(express.json());

app.listen(port, () => {
  console.log(`listening at http://localhost:${3000}`); //app.listen까지 완료해야 페이지가 뜬다.
});
