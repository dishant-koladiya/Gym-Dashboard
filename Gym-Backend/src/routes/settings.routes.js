const express = require("express");
const router = express.Router();
const settingsController = require("../controllers/settings.controller");
const { protect } = require("../middleware/auth.middleware");

router.use(protect);

router.get("/admin", settingsController.getAdmin);
router.post("/admin", settingsController.updateAdmin);
router.get("/gym", settingsController.getGym);
router.post("/gym", settingsController.updateGym);
router.get("/settings", settingsController.getSettings);
router.post("/settings", settingsController.updateSettings);

module.exports = router;
