import { useState } from "react";

export default function ChangePasswordScreen() {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      alert("Mật khẩu mới và xác nhận mật khẩu không khớp!");
      return;
    }

    if (formData.newPassword.length < 6) {
      alert("Mật khẩu mới phải có ít nhất 6 ký tự!");
      return;
    }

    setIsSubmitted(true);

    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }, 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field],
    });
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, text: "" };
    if (password.length < 6)
      return { strength: 1, text: "Yếu", color: "#ff4d4f" };
    if (password.length < 8)
      return { strength: 2, text: "Trung bình", color: "#faad14" };
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return { strength: 2, text: "Trung bình", color: "#faad14" };
    }
    return { strength: 3, text: "Mạnh", color: "#52c41a" };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  if (isSubmitted) {
    return (
      <div
        style={{
          maxWidth: "500px",
          margin: "0 auto",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          padding: "40px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "60px",
            height: "60px",
            backgroundColor: "#52c41a",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            fontSize: "24px",
            color: "white",
          }}
        >
          ✓
        </div>

        <h2 style={{ color: "#333", marginBottom: "16px" }}>
          Đổi mật khẩu thành công!
        </h2>

        <p style={{ color: "#666", lineHeight: "1.5" }}>
          Mật khẩu của bạn đã được cập nhật thành công.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "0 auto",
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: "#1890ff",
          color: "white",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "24px" }}>Đổi mật khẩu</h1>
      </div>

      {/* Content */}
      <div style={{ padding: "32px" }}>
        <form onSubmit={handleSubmit}>
          {/* Current Password */}
          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "500",
                color: "#333",
              }}
            >
              Mật khẩu hiện tại *
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPasswords.current ? "text" : "password"}
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Nhập mật khẩu hiện tại"
                style={{
                  width: "100%",
                  padding: "12px 40px 12px 12px",
                  border: "1px solid #d9d9d9",
                  borderRadius: "6px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("current")}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#666",
                  fontSize: "16px",
                }}
              >
                {showPasswords.current ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "500",
                color: "#333",
              }}
            >
              Mật khẩu mới *
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPasswords.new ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                style={{
                  width: "100%",
                  padding: "12px 40px 12px 12px",
                  border: "1px solid #d9d9d9",
                  borderRadius: "6px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("new")}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#666",
                  fontSize: "16px",
                }}
              >
                {showPasswords.new ? "🙈" : "👁️"}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {formData.newPassword && (
              <div style={{ marginTop: "8px" }}>
                <div
                  style={{
                    display: "flex",
                    gap: "4px",
                    marginBottom: "4px",
                  }}
                >
                  {[1, 2, 3].map((level) => (
                    <div
                      key={level}
                      style={{
                        height: "4px",
                        flex: 1,
                        backgroundColor:
                          passwordStrength.strength >= level
                            ? passwordStrength.color
                            : "#f0f0f0",
                        borderRadius: "2px",
                      }}
                    />
                  ))}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: passwordStrength.color,
                    fontWeight: "500",
                  }}
                >
                  Độ mạnh: {passwordStrength.text}
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: "32px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "500",
                color: "#333",
              }}
            >
              Xác nhận mật khẩu mới *
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPasswords.confirm ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Nhập lại mật khẩu mới"
                style={{
                  width: "100%",
                  padding: "12px 40px 12px 12px",
                  border: `1px solid ${
                    formData.confirmPassword &&
                    formData.newPassword !== formData.confirmPassword
                      ? "#ff4d4f"
                      : "#d9d9d9"
                  }`,
                  borderRadius: "6px",
                  fontSize: "14px",
                  boxSizing: "border-box",
                }}
                required
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("confirm")}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#666",
                  fontSize: "16px",
                }}
              >
                {showPasswords.confirm ? "🙈" : "👁️"}
              </button>
            </div>
            {formData.confirmPassword &&
              formData.newPassword !== formData.confirmPassword && (
                <div
                  style={{
                    color: "#ff4d4f",
                    fontSize: "12px",
                    marginTop: "4px",
                  }}
                >
                  Mật khẩu xác nhận không khớp
                </div>
              )}
          </div>

          {/* Security Tips */}
          <div
            style={{
              backgroundColor: "#f6ffed",
              border: "1px solid #b7eb8f",
              borderRadius: "6px",
              padding: "16px",
              marginBottom: "24px",
            }}
          >
            <h4
              style={{ margin: "0 0 8px", color: "#389e0d", fontSize: "14px" }}
            >
              💡 Gợi ý tạo mật khẩu mạnh:
            </h4>
            <ul
              style={{
                margin: 0,
                paddingLeft: "16px",
                fontSize: "12px",
                color: "#666",
              }}
            >
              <li>Sử dụng ít nhất 8 ký tự</li>
              <li>Kết hợp chữ hoa, chữ thường và số</li>
              <li>Bao gồm ký tự đặc biệt (!@#$%^&*)</li>
              <li>Tránh sử dụng thông tin cá nhân</li>
            </ul>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#52c41a",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "16px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "background-color 0.3s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#73d13d";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "#52c41a";
            }}
          >
            Cập nhật mật khẩu
          </button>
        </form>
      </div>
    </div>
  );
}
