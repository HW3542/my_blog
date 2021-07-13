const jwt = require("jsonwebtoken"); // 검증을 위해 라이브러리를 불러와야 함
const User = require("../schemas/user");

module.exports = async (req, res, next) => {
  const { authorization } = req.headers;
  if (authorization == undefined) {
    res.redirect("/alert.html");
  }

  try {
    const [tokenType, tokenValue] = authorization.split(" ");

    if (tokenType !== "Bearer") {
      //Bearer이 토큰이 잘 들어왔을때 생김. Bearer은 jwt에서 쓰는 타입. 여기서 두번을 검증한다.
      res.redirect("/alert.html");
    }

    const { nickname } = jwt.verify(tokenValue, "my-secret-key");
    User.findOne({ nickname }).then((user) => {
      res.locals.user = user; // locals는 express에서 지원해주는 변수이다. 다른 곳에서 다 쓸 수 있다.
      next(); // 맨 밑에 next를 써주면 안된다. next가 두번 호출된다.
    });
  } catch (error) {
    res.redirect("/alert.html");  //ajax가 보내서 실행안됨??
    res.status(401).send()
  }
};
