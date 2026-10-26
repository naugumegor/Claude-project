-- Yegor's BME timetable, autumn 2026 (from Neptun). Two weeks alternate: in odd weeks
-- (counted from the semester start, 2026-09-07) Technical Chemistry is on Monday at 12:15,
-- in even weeks Introduction to Mechanical Engineering is on Tuesday at 8:15.
-- Inserted only into an empty timetable, so edits made on the site are never overwritten.
INSERT INTO "timetable" ("weekday", "starts", "ends", "title", "room", "kind", "parity")
SELECT v.weekday, v.starts, v.ends, v.title, v.room, 'lecture'::"class_kind", v.parity::"week_parity"
FROM (VALUES
  (1, '08:15', '10:00', 'Programming in the Python Language', 'KF81', 'every'),
  (1, '10:15', '12:00', 'Statics', 'K150', 'every'),
  (1, '12:15', '14:00', 'Technical Chemistry', 'F2ALGS', 'odd'),
  (1, '14:15', '16:00', 'Mathematics G1', 'K174', 'every'),
  (2, '08:15', '10:00', 'Introduction to Mechanical Engineering', 'L-HIDROLAB', 'even'),
  (2, '10:15', '13:00', 'Fundamentals of Mechanical Engineering Drawing', 'KM34', 'every'),
  (2, '14:15', '16:00', 'Mathematics G1', 'K174', 'every'),
  (2, '16:15', '18:00', 'Fundamentals of Mechanical Engineering Drawing', 'R111, R112', 'every'),
  (3, '10:15', '12:00', 'Introduction to Mechanical Engineering', 'D304', 'every'),
  (3, '12:15', '14:00', 'Programming in the Python Language', 'D411', 'every'),
  (3, '14:15', '16:00', 'Technical Chemistry', 'K155', 'every'),
  (4, '08:15', '10:00', 'Introduction to Mechanical Engineering', 'K150', 'every'),
  (4, '12:15', '14:00', 'Statics', 'R108', 'every'),
  (4, '16:15', '18:00', 'Mathematics G1', 'KF81', 'every')
) AS v(weekday, starts, ends, title, room, parity)
WHERE NOT EXISTS (SELECT 1 FROM "timetable");
