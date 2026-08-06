import React, { useState, useEffect } from "react";
import "./decorate/signInAndUp.css"; // Paste your <style> content into this file
import close_eye from "../assets/closed-eyes.png";
import GetStart from "./GetStart";
import { useNavigate } from "react-router-dom";
import LoginPanel from "./loginAndRegister/loginPanel";
import RegisterPanel from "./loginAndRegister/registerPanel";
import { userViewModel } from "../modelViews/userModelView";
import { RegisterCredentials } from "../models/userModel";
import { useApp } from "../context/AppContext";
export default function SignInAndUp() {
  //views Model user
  const userVm = new userViewModel();
  const [activeTab, setActiveTab] = useState("login");

  //naviagate
  const navigate = useNavigate();
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({
    message: "",
    type: "success",
    show: false,
  });

  const showToast = (message: string, type = "success") => {
    setToast({ message, type, show: true });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3200);
  };
  const { fetchMyBranches } = useApp();
  const handleNavigation = async () => {
    const accessToken = localStorage.getItem("accessToken") || localStorage.getItem("access_token");
    if (accessToken && accessToken !== "") {
      const userRole = localStorage.getItem("userRole") || localStorage.getItem("user_role");
      if (userRole === "admin") {
        navigate("/admin/home");
      } else {
        const fetchedBranches = await fetchMyBranches();
        if (!fetchedBranches || fetchedBranches.length === 0) {
          navigate("/getstart");
        } else {
          navigate("/selectbranch");
        }
      }
    }
  };

  const handleLoginSubmit = async (credentials: { username: string; password: string }) => {
    if (!credentials.username || !credentials.password) {
      //close
      console.log('username and password : ', credentials.username, credentials.password)
      showToast("Please fill in all fields", "error");
      return;
    }
    setIsLoading(true);
    //login api call
    const result = await userVm.login(credentials.username, credentials.password);
    if (result?.isError) {
      showToast(result?.errorMessage, "error");
      setIsLoading(false);
      return;
    } else {
      setTimeout(() => {
        setIsLoading(false);
        showToast(`Welcome back, ${credentials.username}! 🎓`, "success");
        handleNavigation();
      }, 1400);
    }
  };

  const handleRegisterSubmit = async (credentials: RegisterCredentials) => {
    setIsLoading(true);
    const result = await userVm.register(credentials);
    if (result?.isError) {
      showToast(result?.errorMessage || "Registration failed", "error");
      setIsLoading(false);
      return;
    } else {
      setTimeout(() => {
        setIsLoading(false);
        showToast(`Account created! Welcome, ${credentials.fullName} 🎉`, "success");
        handleNavigation();
      }, 1600);
    }
  };

  return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <div className="bg-layer"></div>
        <div className="bg-grid"></div>
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>

        <main
          className="page"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            width: "100%",
          }}
        >
          <div className="brand">
            <div className="brand-mark">
              <div className="brand-icon">⚡</div>
              <span className="brand-name">G16 · AER</span>
            </div>
            <div className="brand-sub">
              Adaptive Exercise Recommendation based on User Profiles
            </div>
          </div>

          <div className="card" id="mainCard">
            <div className="tabs">
              <button
                className={`tab-btn ${activeTab === "login" ? "active" : ""}`}
                onClick={() => setActiveTab("login")}
              >
                Login
              </button>
              <button
                className={`tab-btn ${activeTab === "register" ? "active" : ""}`}
                onClick={() => setActiveTab("register")}
              >
                Register
              </button>
            </div>

            {/* LOGIN PANEL */}
            {activeTab === "login" && (
              <LoginPanel
                onSubmit={(credentials) => {
                  handleLoginSubmit(credentials);
                }}
                isLoading={isLoading}
                onSwitchTab={() => setActiveTab("register")}
              />
            )}

            {/* REGISTER PANEL */}
            {activeTab === "register" && (
              <RegisterPanel
                onSubmit={(credentials) => {
                  handleRegisterSubmit(credentials);
                }}
                isLoading={isLoading}
                onSwitchTab={() => setActiveTab("login")}
              />
            )}

            {/* <div className="card-footer">
            By continuing you agree to our <a href="#">Terms of Service</a> &amp; <a href="#">Privacy Policy</a>
          </div> */}
          </div>
        </main>

        <div className={`toast ${toast.type} ${toast.show ? "show" : ""}`}>
          {toast.message}
        </div>
      </div>
    );
}
