const pool = require("../db");

// جلب بيانات المستخدم واهتماماته
const getUserProfile = async (req, res) => {
  const { userId } = req.params;
  try {
    const userRes = await pool.query(
      "SELECT id, username, email FROM users WHERE id=$1",
      [userId]
    );

    const interestsRes = await pool.query(
      `SELECT ui.category_id, c.name 
       FROM user_interests ui 
       JOIN categories c ON ui.category_id = c.id 
       WHERE ui.user_id=$1`,
      [userId]
    );

    res.json({
      user: userRes.rows[0],
      interests: interestsRes.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load user profile" });
  }
};

// تعديل بيانات المستخدم
const updateUserProfile = async (req, res) => {
  const { userId } = req.params;
  const { username, email } = req.body;
  try {
    const result = await pool.query(
      "UPDATE users SET username=$1, email=$2 WHERE id=$3 RETURNING *",
      [username, email, userId]
    );
    res.json({ message: "User updated", user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update user" });
  }
};

// تعديل اهتمامات المستخدم
const updateUserInterests = async (req, res) => {
  const user_id = Number(req.params.userId);
  let { interests } = req.body;

  if (!user_id || isNaN(user_id)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  // ضمان أن interests هي Array
  if (!Array.isArray(interests)) {
    if (!interests) interests = [];
    else interests = [Number(interests)];
  }

  // تصفية القيم الغير صالحة (null, 0, NaN)
  interests = interests.map((id) => Number(id)).filter((id) => id > 0);

  try {
    // حذف اهتمامات قديمة
    await pool.query("DELETE FROM user_interests WHERE user_id = $1", [
      user_id,
    ]);

    // إدخال الاهتمامات الجديدة فقط إذا كانت موجودة
    if (interests.length > 0) {
      const insertQuery =
        "INSERT INTO user_interests (user_id, category_id) VALUES ($1, $2)";
      for (const categoryId of interests) {
        await pool.query(insertQuery, [user_id, categoryId]);
      }
    }

    res.json({ message: "Interests updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update interests" });
  }
};

module.exports = { getUserProfile, updateUserProfile, updateUserInterests };
