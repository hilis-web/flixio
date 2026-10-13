const pool = require("../db");

const DEFAULT_TIMEZONE = "Europe/Madrid";

const isValidTime = (value) =>
  typeof value === "string" && /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);

const isValidTimezone = (value) => {
  if (typeof value !== "string" || value.length > 100) {
    return false;
  }

  try {
    Intl.DateTimeFormat("en-US", {
      timeZone: value,
    });
    return true;
  } catch {
    return false;
  }
};

exports.getSettings = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT enabled, reminder_time, timezone
       FROM study_reminders
       WHERE user_id = $1`,
      [userId],
    );

    if (result.rows.length === 0) {
      return res.json({
        enabled: false,
        reminderTime: "19:00",
        timezone: DEFAULT_TIMEZONE,
      });
    }

    const row = result.rows[0];

    return res.json({
      enabled: row.enabled,
      reminderTime: String(row.reminder_time).slice(0, 5),
      timezone: row.timezone,
    });
  } catch (error) {
    console.error("Get study reminder settings error:", error);

    return res.status(500).json({
      message: "Failed to load study reminder settings.",
    });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { enabled, reminderTime, timezone } = req.body;

    if (typeof enabled !== "boolean") {
      return res.status(400).json({
        message: "Enabled must be a boolean.",
      });
    }

    if (!isValidTime(reminderTime)) {
      return res.status(400).json({
        message: "Reminder time must use HH:mm format.",
      });
    }

    const selectedTimezone = timezone ?? DEFAULT_TIMEZONE;

    if (!isValidTimezone(selectedTimezone)) {
      return res.status(400).json({
        message: "Invalid timezone.",
      });
    }

    const result = await pool.query(
      `INSERT INTO study_reminders (
         user_id,
         enabled,
         reminder_time,
         timezone,
         updated_at
       )
       VALUES ($1, $2, $3::TIME, $4, NOW())
       ON CONFLICT (user_id)
       DO UPDATE SET
         enabled = EXCLUDED.enabled,
         reminder_time = EXCLUDED.reminder_time,
         timezone = EXCLUDED.timezone,
         updated_at = NOW()
       RETURNING enabled, reminder_time, timezone`,
      [userId, enabled, reminderTime, selectedTimezone],
    );

    const row = result.rows[0];

    return res.json({
      message: "Study reminder settings saved.",
      settings: {
        enabled: row.enabled,
        reminderTime: String(row.reminder_time).slice(0, 5),
        timezone: row.timezone,
      },
    });
  } catch (error) {
    console.error("Update study reminder settings error:", error);

    return res.status(500).json({
      message: "Failed to save study reminder settings.",
    });
  }
};
