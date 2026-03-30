const axios = require('axios');
const supabase = require('../config/supabase')

const Signup = async (req, res) => {
    try {
        const { rider_id, Name, email, password, phone_number } = req.body;
        if (!rider_id || !Name || !email || !password) {
            return res.status(400).json("Please Fill all Fields");
        }
        const response = await axios.get(
            `http://127.0.0.1:8000/api/zomato/v2/fleet/${rider_id}/profile`
        )
        if (response.data.status == "success") {
            const { data, error } = await supabase.from('users').insert([
                {
                    Rider_id: rider_id,
                    Name: Name,
                    Email: email,
                    Password: password,
                    Phone: phone_number
                }]);
            if (error) {
                return res.status(500).json({ "message": "Something Went Wrong While inserting data", error })
            }

            return res.status(201).json({ "message": `User Created Successfully ${data}` });
        }
        return res.status(404).json({ "message": "Rider not Found!!" })
    } catch (error) {
        return res.status(500).json({ "message": "Internal Server Error" });
    }
};
const sendOTP = async(req,res)=>{
    const {Phone_no} = req.body;
    const {data , error} = await supabase.auth.signInWithOtp({phone:`${Phone_no}`});
    if(error){
        return res.status(500).json({"message":"Something Went Wrong while Sending OTP"});
    }
    return res.status(200).json({"message":"OTP Send!!"});
}
const verifyOTP = async(req,res)=>{
    const {Phone_no , OTP} = req.body;
    const {data,error} = await supabase.auth.verifyOtp(
        {
            phone:Phone_no,
            token:OTP,
            type:'sms'
        }
    )
    if(error){
         return res.status(500).json({"message":"OTP mismatched!!"});
    }
    const {data1 , error1} = await supabase.from('users').update({ phone_number_verified: true }).eq('phone',`${Phone_no}`);
    if(error1){
           return res.status(500).json({"message":"Db is Down!!"});
    }
    return res.status(200).json({"message":"OTP Verified"});
}
module.exports = {Signup,sendOTP,verifyOTP};