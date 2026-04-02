import { useState } from "react";
import "./Bankinfo.css";

export default function Bankinfo() {
  const [formData, setFormData] = useState({
    accountHolder: "",
    accountNumber: "",
    ifsc: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const phone = localStorage.getItem("userPhone");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.accountHolder.trim()) {
      return "Account holder name is required";
    }

    if (!formData.accountNumber.trim()) {
      return "Account number is required";
    }

    if (!/^\d{9,18}$/.test(formData.accountNumber)) {
      return "Account number must be 9 to 18 digits";
    }

    if (!formData.ifsc.trim()) {
      return "IFSC code is required";
    }

    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifsc.toUpperCase())) {
      return "Invalid IFSC code format";
    }

    if (!phone) {
      return "User phone not found. Please login again.";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    const validationError = validateForm();
    if (validationError) {
      setMessage(validationError);
      setIsError(true);
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("http://localhost:8000/api/payout/bank-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone,
          accountHolder: formData.accountHolder.trim(),
          accountNumber: formData.accountNumber.trim(),
          ifsc: formData.ifsc.trim().toUpperCase(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to save bank details");
      }

      setMessage("Bank details saved successfully");
      setIsError(false);

      setFormData({
        accountHolder: "",
        accountNumber: "",
        ifsc: "",
      });
    } catch (error) {
      setMessage(error.message || "Something went wrong");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bank-page">
      <div className="bank-card">
        <div className="bank-header">
          <h1>Add Bank Details</h1>
          <p>
            Save your payout account so insurance money can be sent automatically
            when a disruption happens.
          </p>
        </div>

        <form className="bank-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="accountHolder">Account Holder Name</label>
            <input
              id="accountHolder"
              type="text"
              name="accountHolder"
              placeholder="Enter account holder name"
              value={formData.accountHolder}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="accountNumber">Account Number</label>
            <input
              id="accountNumber"
              type="text"
              name="accountNumber"
              placeholder="Enter bank account number"
              value={formData.accountNumber}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="ifsc">IFSC Code</label>
            <input
              id="ifsc"
              type="text"
              name="ifsc"
              placeholder="Enter IFSC code"
              value={formData.ifsc}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="save-btn" disabled={loading}>
            {loading ? "Saving..." : "Save Bank Details"}
          </button>

          {message && (
            <div className={`form-message ${isError ? "error" : "success"}`}>
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}