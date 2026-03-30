const router = require('express').Router()
const supabase = require('../config/supabase');
const {Signup, sendOTP, verifyOTP}= require('../Controller/UserController');
const {getRiderProfile} = require('../Controller/ZomatoController')

router.post('/add', async (req, res) => {
  const { name, email, age } = req.body;

  const { data, error } = await supabase
    .from('users')
    .insert([{ name, email, age }]);

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
});

router.get('/users', async (req, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('*');

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
});

router.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, age } = req.body;

  const { data, error } = await supabase
    .from('users')
    .update({ name, email, age })
    .eq('id', id);

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
});

router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id);

  if (error) return res.status(500).json({ error: error.message });

  res.json({ message: 'User Deleted' });
});

router.get('/zomato/v2/fleet/:fleetId/profile',getRiderProfile);
router.get('/Test',Signup);
router.post('/getOTP',sendOTP);
router.post('/verifyOTP',verifyOTP);
router.get('/health-check',(req,res)=>{
  return res.status(200).json({"message":"Working!!"})
})
module.exports=router