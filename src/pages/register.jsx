import { useState } from "react";
import { useNavigate } from "react-router";
const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    userName: "",
    password: "",
    confirmPassword: "",
  });
  const [emailError, setEmailError] = useState(null);
  const [nameError, setNameError] = useState(null);
  const [userNameError, setUserNameError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState(null);
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  const navigate = useNavigate();
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
    console.log(formData);
  };
  const handleName = (name) => {
    if (!name.trim()) {
      setNameError("Name Field is Required!");
    } else {
      setNameError(null);
    }
  };

  const handleEmail = (email) => {
    if (!email) {
      setEmailError("Email field is required!");
    } else if (emailRegex.test(email)) {
      setEmailError(null);
    } else {
      setEmailError("Invalid Email");
    }
  };

  const handleUserName = (userName) => {
    if (!userName) {
      setUserNameError("User Name is Required");
    } else if (/\s/.test(userName)) {
      setUserNameError("User Name shouldn't has spaces");
    } else {
      setUserNameError(null);
    }
  };

  const handlePassword = (password) => {
    if (!password) {
      setPasswordError("Password is Required!");
    } else if (!passwordRegex.test(password)) {
      setPasswordError(
        "Password must be at least 8 characters with: 1 uppercase, 1 lowercase, 1 number, and 1 special character"
      );
    } else {
      setPasswordError(null);
    }
  };

  const handleConfirmPassword = (confirmPassword) => {
    if (!confirmPassword) {
      setConfirmPasswordError("you must confirm your password!");
    } else if (confirmPassword !== formData.password) {
      setConfirmPasswordError("it doesn't match your password!");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    handleName(formData.name);
    handleEmail(formData.email);
    handleUserName(formData.userName);
    handlePassword(formData.password);
    handleConfirmPassword(formData.confirmPassword);

    const isAnyFieldEmpty =
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.userName.trim() ||
      !formData.password.trim() ||
      !formData.confirmPassword.trim();

    // const hasErrors =
    //   nameError ||
    //   emailError ||
    //   userNameError ||
    //   passwordError ||
    //   confirmPasswordError ||
    //   isAnyFieldEmpty;

    if (isAnyFieldEmpty) {
      if (!formData.name.trim()) setNameError("Name Field is Required!");
      if (!formData.email.trim()) setEmailError("Email is Required!");
      if (!formData.userName.trim()) setUserNameError("User Name is Required!");
      if (!formData.password.trim()) setPasswordError("Password is Required!");
      if (!formData.confirmPassword.trim())
        setConfirmPasswordError("You must confirm your password!");
      return;
    }

    if (
      !emailError &&
      !nameError &&
      !userNameError &&
      !passwordError &&
      !confirmPasswordError
    ) {
      alert(
        `Name: ${formData.name}, Email: ${formData.email}, User Name: ${formData.userName}`
      );
      navigate("/");
    }
  };

  return (
    <>
      <form
        className="border border-2"
        onSubmit={handleSubmit}
        style={{
          width: "50%",
          margin: "auto",
          marginTop: "3em",
          padding: "4em",
        }}
      >
        <label htmlFor="name" style={{ display: "block", marginTop: "1em" }}>
          Name
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          onBlur={() => handleName(formData.name)}
          style={{ display: "block", width: "100%", height: "2em" }}
        ></input>
        {nameError && <div style={{ color: "red" }}>{nameError}</div>}
        <label htmlFor="email" style={{ display: "block", marginTop: "1em" }}>
          Email
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={() => handleEmail(formData.email)}
          style={{ display: "block", width: "100%", height: "2em" }}
        ></input>
        {emailError && <div style={{ color: "red" }}>{emailError}</div>}
        <label
          htmlFor="userName"
          style={{ display: "block", marginTop: "1em" }}
        >
          User Name
        </label>
        <input
          type="text"
          name="userName"
          value={formData.userName}
          onChange={handleChange}
          onBlur={() => handleUserName(formData.userName)}
          style={{ display: "block", width: "100%", height: "2em" }}
        ></input>
        {userNameError && <div style={{ color: "red" }}>{userNameError}</div>}
        <label
          htmlFor="password"
          style={{ display: "block", marginTop: "1em" }}
        >
          Password
        </label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          onBlur={() => handlePassword(formData.password)}
          style={{ display: "block", width: "100%", height: "2em" }}
        ></input>
        {passwordError && <div style={{ color: "red" }}>{passwordError}</div>}
        <label
          htmlFor="confirmPassword"
          style={{ display: "block", marginTop: "1em" }}
        >
          Confirm Password
        </label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          onBlur={() => handleConfirmPassword(formData.confirmPassword)}
          style={{ display: "block", width: "100%", height: "2em" }}
        ></input>
        {confirmPasswordError && (
          <div style={{ color: "red" }}>{confirmPasswordError}</div>
        )}
        <button
          className="btn btn-success"
          type="submit"
          style={{ marginTop: "1em" }}
        >
          Submit
        </button>
      </form>
    </>
  );
};
export default Register;
