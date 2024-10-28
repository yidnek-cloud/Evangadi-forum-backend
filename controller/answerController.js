const dbConnection = require("../db/dbConfig");
const { StatusCodes } = require("http-status-codes");

const getAnswer = async (req, res) => {
  const { questionid } = req.params;

  try {
    const [answers] = await dbConnection.query(
      `SELECT answerid AS answer_id, answer AS content, created_at, u.username FROM answers a JOIN users u ON a.userid = u.userid WHERE questionid = ? ORDER BY a.created_at DESC`,
      [questionid]
    );
    if (answers.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "The requested question could not be found.",
      });
    } else {
      return res.status(StatusCodes.OK).json({ answers: answers });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "An unexpected error occurred",
    });
  }
};

const postAnswers = async (req, res) => {
  const { questionid, answer } = req.body;
  console.log(req.body);
  if (!answer) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Please provide an answer" });
  }

  try {
    const userid = req.user.userid;

    await dbConnection.query(
      "INSERT INTO answers (userid, questionid, answer) VALUES (?, ?, ?)",
      [userid, questionid, answer]
    );

    res.status(StatusCodes.CREATED).json({ msg: "Answer posted successfully" });
  } catch (error) {
    console.log(error.message);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: "An unexpected error occurred." });
  }
};
module.exports = { postAnswers, getAnswer };

// test 