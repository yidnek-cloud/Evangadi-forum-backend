const express = require("express");

const router = express.Router();
//question controllers
const {
  getAllQuestions,
  postquestion,SingleQuestion
} = require("../controller/questionController");


router.get("/all-questions", getAllQuestions);

//post question route
router.post("/question", postquestion);

router.get("/:question_id",SingleQuestion)
module.exports = router;