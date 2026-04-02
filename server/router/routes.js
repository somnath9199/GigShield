const router = require('express').Router()
const supabase = require('../config/supabase');
const Dynamic_calculator = require('../Controller/Dynamic_calculator');
const { Signup, sendOTP, verifyOTP,addBankInfo,getUserProfile} = require('../Controller/UserController');
const {getRiderProfile} = require('../Controller/ZomatoController')
const {
  getAllDisruptions,
  getActiveDisruptions,
  getUpcomingDisruptions,
  getDisruptionsByLocation,
  getDisruptionById,
  checkRiderDisruption,
} = require("../Controller/MockDistruptionController");
const {
  setupBankDetails,
  getPayoutHistory,
} = require("../Controller/PayoutController");
const {
  getAllPayouts,
  getPayoutsByPhone,
  getPayoutById,
} = require("../Controller/PayoutController");



router.get('/zomato/v2/fleet/:fleetId/profile',getRiderProfile);
router.post('/signup', Signup);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.get('/health-check',(req,res)=>{
  return res.status(200).json({"message":"Working!!"})
})
router.get("/premium/:fleetId", Dynamic_calculator);
router.get("/mock-disruptions", getAllDisruptions);
router.get("/mock-disruptions/active", getActiveDisruptions);
router.get("/mock-disruptions/upcoming", getUpcomingDisruptions);
router.get("/mock-disruptions/location", getDisruptionsByLocation);
router.get("/mock-disruptions/check/:riderId", checkRiderDisruption);
router.get("/mock-disruptions/:id", getDisruptionById);
router.post("/payout/setup-bank", setupBankDetails);
router.get("/payout/history/:phone", getPayoutHistory);
router.post("/payout/bank-info", addBankInfo);
router.get("/payouts", getAllPayouts);
router.get("/payouts/:phone", getPayoutsByPhone);
router.get("/payout/:id", getPayoutById);
router.get("/user/profile/:phone", getUserProfile);
module.exports=router