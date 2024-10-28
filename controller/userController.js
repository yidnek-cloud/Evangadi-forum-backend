// db connection
const dbConnection = require("../db/dbConfig");
//encryption
const bcrypt = require("bcrypt");
//status code
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");

//===============registration (sign up)====================//

const register = async (req, res) => {
  const { username, firstname, lastname, email, password } = req.body;
  if (!email || !password || !firstname || !lastname || !username) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Please provide all required fields" });
  }

  try {
    //check whether the current user is registered or not
    const [user] = await dbConnection.query(
      "SELECT username, userid from users where username = ? or email = ?",
      [username, email]
    );
    // return res.json({ user: user });
    if (user.length > 0) {
      return res
        .status(StatusCodes.CONFLICT)
        .json({ msg: "User already existed" });
    }
    //check if the password is greater than or equals to 8
    if (password.length < 8) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "Password must be at least 8 characters" });
    }

    //encrypt the password
    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);
    // register on the database
    await dbConnection.query(
      "INSERT INTO users (username, firstname, lastname, email, password) VALUES (?,?,?,?,?)",
      [username, firstname, lastname, email, hashedPassword]
    );
    return res
      .status(StatusCodes.CREATED)
      .json({ msg: "User registered successfully" });
  } catch (error) {
    console.log(error.message);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "An unexpected error occurred." });
  }
};

//===============Login====================//
const login = async (req, res) => {
  // res.send("login");
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Please provide all required fields" });
  }

  try {
    const [user]= await dbConnection.query(
      "SELECT username, userid,password from users where email = ?",
      [email]
    );
    //  return res.json({ user: user });  
    if (user.length == 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: "Invalid credentials ",
      });
    }

    // compare password

    const isMatch = await bcrypt.compare(password, user[0].password);
    if (!isMatch) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        msg: "Invalid email or password",
      });
    }
    
    // return res.json({ user:user[0].password });


    const username = user[0].username;
    const userid = user[0].userid;
    const token = jwt.sign({ username, userid }, "secret", { expiresIn: "1d" });
    
    return res.status(StatusCodes.OK).json({
      message: "User login successful",
      token,
    });
  } catch (error) {
    console.log(error.message);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "An unexpected error occurred." });
  }
};

//=================checkUser====================//
const checkUser = async (req, res) => {
  const username = req.user.username;
  const userid = req.user.userid;
  res.status(StatusCodes.OK).json({ msg: "Valid user", username, userid });
};

module.exports = { register, login, checkUser };
