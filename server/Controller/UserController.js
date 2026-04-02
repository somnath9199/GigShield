const axios = require('axios');
const supabase = require('../config/supabase');

// SIGNUP
const Signup = async (req, res) => {
  try {
    const { rider_id, Name, email, password, phone_number } = req.body;

    if (!rider_id || !Name || !email || !password || !phone_number) {
      return res.status(400).json({
        message: 'Please fill all required fields',
      });
    }

    // Check rider from external API
    const response = await axios.get(
      `http://127.0.0.1:8000/api/zomato/v2/fleet/${rider_id}/profile`
    );

    if (response.data.status !== 'success') {
      return res.status(404).json({
        message: 'Rider not found',
      });
    }

    // Insert into users table
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          rider_id: rider_id,
          name: Name,
          email: email,
          password: password,
          phone: phone_number,
        },
      ])
      .select();

    if (error) {
      return res.status(500).json({
        message: 'Something went wrong while inserting data',
        error: error.message,
      });
    }

    return res.status(201).json({
      message: 'User created successfully',
      user: data,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

// SEND OTP
const sendOTP = async (req, res) => {
  try {
    const { Phone_no } = req.body;

    if (!Phone_no) {
      return res.status(400).json({
        message: 'Phone number is required',
      });
    }

    const { data, error } = await supabase.auth.signInWithOtp({
      phone: Phone_no,
    });

    if (error) {
      return res.status(500).json({
        message: 'Something went wrong while sending OTP',
        error: error.message,
      });
    }

    return res.status(200).json({
      message: 'OTP sent successfully',
      data,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

// VERIFY OTP
const verifyOTP = async (req, res) => {
  try {
    const { Phone_no, OTP } = req.body;

    if (!Phone_no || !OTP) {
      return res.status(400).json({
        message: 'Phone number and OTP are required',
      });
    }

    const { data, error } = await supabase.auth.verifyOtp({
      phone: Phone_no,
      token: OTP,
      type: 'sms',
    });

    if (error) {
      return res.status(400).json({
        message: 'OTP mismatched or invalid',
        error: error.message,
      });
    }

    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ phone_number_verified: true })
      .eq('phone', Phone_no)
      .select();

    if (updateError) {
      return res.status(500).json({
        message: 'Database update failed',
        error: updateError.message,
      });
    }

    if (!updatedUser || updatedUser.length === 0) {
      return res.status(404).json({
        message: 'User not found with this phone number',
      });
    }

    return res.status(200).json({
      message: 'OTP verified successfully',
      user: updatedUser,
      authData: data,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

const addBankInfo = async (req, res) => {
  try {
    const { phone, accountHolder, accountNumber, ifsc } = req.body;

    if (!phone || !accountHolder || !accountNumber || !ifsc) {
      return res.status(400).json({
        success: false,
        message: "phone, accountHolder, accountNumber and ifsc are required",
      });
    }

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, phone")
      .eq("phone", phone)
      .maybeSingle();

    if (userError) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch user",
        error: userError.message,
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { data, error } = await supabase
      .from("users")
      .update({
        bank_account_holder: accountHolder,
        bank_account_number: accountNumber,
        bank_ifsc: ifsc,
        payout_setup_done: true,
      })
      .eq("phone", phone)
      .select()
      .maybeSingle();

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to save bank details",
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Bank details added successfully",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
// GET /api/user/profile/:phone
const getUserProfile = async (req, res) => {
  try {
    const { phone } = req.params;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone is required",
      });
    }

    const { data, error } = await supabase
      .from("users")
      .select(`
        id,
        rider_id,
        name,
        email,
        phone,
        phone_number_verified,
        selected_plan,
        this_week_premium,
        coverage_status,
        include_heat,
        payout_setup_done,
        bank_account_holder,
        bank_account_number,
        bank_ifsc,
        created_at
      `)
      .eq("phone", phone)
      .maybeSingle();

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch user profile",
        error: error.message,
      });
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const maskedAccountNumber = data.bank_account_number
      ? `****${String(data.bank_account_number).slice(-4)}`
      : null;

    return res.status(200).json({
      success: true,
      message: "User profile fetched successfully",
      data: {
        id: data.id,
        rider_id: data.rider_id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        phone_number_verified: data.phone_number_verified,
        selected_plan: data.selected_plan,
        this_week_premium: data.this_week_premium,
        coverage_status: data.coverage_status,
        include_heat: data.include_heat,
        payout_setup_done: data.payout_setup_done,
        bank_account_holder: data.bank_account_holder,
        bank_account_number: maskedAccountNumber,
        bank_ifsc: data.bank_ifsc,
        created_at: data.created_at,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = { Signup, sendOTP, verifyOTP,addBankInfo,getUserProfile};