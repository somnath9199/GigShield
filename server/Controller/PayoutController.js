const supabase = require("../config/supabase");

// POST /api/payout/setup-bank
const setupBankDetails = async (req, res) => {
  try {
    const { phone, accountHolder, accountNumber, ifsc } = req.body;

    if (!phone || !accountHolder || !accountNumber || !ifsc) {
      return res.status(400).json({
        success: false,
        message: "All bank fields are required",
      });
    }

    const { data: updatedUser, error } = await supabase
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
      message: "Bank details saved successfully",
      data: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// GET /api/payout/history/:phone
const getPayoutHistory = async (req, res) => {
  try {
    const { phone } = req.params;

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, rider_id, phone")
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

    const { data: payouts, error: payoutError } = await supabase
      .from("payouts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (payoutError) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch payout history",
        error: payoutError.message,
      });
    }

    return res.status(200).json({
      success: true,
      data: payouts || [],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// GET /api/payouts
const getAllPayouts = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("payouts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch payouts",
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      count: data?.length || 0,
      data: data || [],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// GET /api/payouts/:phone
const getPayoutsByPhone = async (req, res) => {
  try {
    const { phone } = req.params;

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, rider_id, phone, name")
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

    const { data: payouts, error: payoutError } = await supabase
      .from("payouts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (payoutError) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch payout history",
        error: payoutError.message,
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        rider_id: user.rider_id,
      },
      count: payouts?.length || 0,
      data: payouts || [],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// GET /api/payout/:id
const getPayoutById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("payouts")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch payout",
        error: error.message,
      });
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Payout not found",
      });
    }

    return res.status(200).json({
      success: true,
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





module.exports = {
  setupBankDetails,
  getPayoutHistory,
  getAllPayouts,
  getPayoutsByPhone,
  getPayoutById
};