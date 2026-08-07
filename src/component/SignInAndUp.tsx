import React, { useState, useRef, useEffect } from "react";
import "./decorate/signInAndUp.css";
import { useNavigate } from "react-router-dom";
import LoginPanel from "./loginAndRegister/loginPanel";
import RegisterPanel from "./loginAndRegister/registerPanel";
import { userViewModel } from "../modelViews/userModelView";
import { RegisterCredentials } from "../models/userModel";
import { useApp } from "../context/AppContext";
import { useToast } from "../context/ToastContext";
import authIllustration from "../assets/18.svg";
import SpatterBackground from "./SpatterBackground";

const LIGHT_INK = "#0047ab";
const DARK_INK = "#6ea8ff";

export default function SignInAndUp() {
  //views Model user
  const userVm = new userViewModel();
  const [activeTab, setActiveTab] = useState("login");
  const [dark, setDark] = useState(false);

  //naviagate
  const navigate = useNavigate();
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
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
      toast.error("Please fill in all fields");
      return;
    }
    setIsLoading(true);
    //login api call
    const result = await userVm.login(credentials.username, credentials.password);
    if (result?.isError) {
      toast.error(result?.errorMessage || "Login failed");
      setIsLoading(false);
      return;
    } else {
      setTimeout(() => {
        setIsLoading(false);
        toast.success(`Welcome back, ${credentials.username}! 🎓`);
        handleNavigation();
      }, 1400);
    }
  };

  const handleRegisterSubmit = async (credentials: RegisterCredentials) => {
    setIsLoading(true);
    const result = await userVm.register(credentials);
    if (result?.isError) {
      toast.error(result?.errorMessage || "Registration failed");
      setIsLoading(false);
      return;
    } else {
      setTimeout(() => {
        setIsLoading(false);
        toast.success(`Account created! Welcome, ${credentials.fullName} 🎉`);
        handleNavigation();
      }, 1600);
    }
  };

  // ── Pointer-driven glow / tilt / sheen ──
  // Driven directly off pointermove (not a requestAnimationFrame loop —
  // rAF is suspended by the browser whenever the tab/pane isn't visible,
  // which made the effect appear "dead" under some preview setups). The
  // eased "chase" motion now comes from CSS transitions on transform
  // instead of manual JS lerping.
  const pageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const sheenRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const page = pageRef.current;
      const card = cardRef.current;
      const glow = glowRef.current;
      const sheen = sheenRef.current;
      if (!page || !card || !glow || !sheen) return;

      const pageRect = page.getBoundingClientRect();
      const tx = e.clientX - pageRect.left;
      const ty = e.clientY - pageRect.top;
      const inside = tx >= 0 && ty >= 0 && tx <= pageRect.width && ty <= pageRect.height;

      // .auth-glow is absolutely positioned within .auth-page, which is its
      // own internally-scrolling box (see signInAndUp.css) — its top:0
      // reference is the unscrolled content, so add scrollTop back in.
      glow.style.transform = `translate3d(${tx}px, ${ty + page.scrollTop}px, 0)`;
      glow.style.opacity = inside ? "1" : "0";

      // const cardRect = card.getBoundingClientRect();
      // const cx = cardRect.left + cardRect.width / 2 - pageRect.left;
      // const cy = cardRect.top + cardRect.height / 2 - pageRect.top;
      // const ry = Math.max(-1, Math.min(1, (tx - cx) / (cardRect.width * 0.9))) * 4.5;
      // const rx = Math.max(-1, Math.min(1, (ty - cy) / (cardRect.height * 0.9))) * -3.5;
      // card.style.transform = inside
      //   ? `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`
      //   : "rotateX(0deg) rotateY(0deg)";

      // sheen.style.transform = `translate3d(${tx - (cardRect.left - pageRect.left)}px, ${
      //   ty - (cardRect.top - pageRect.top)
      // }px, 0)`;
      sheen.style.opacity = inside ? "1" : "0";
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
      <div className="auth-page" data-theme={dark ? "dark" : undefined} ref={pageRef}>
        <div className="auth-bg-fixed">
          <SpatterBackground className="spatter-canvas" color={dark ? DARK_INK : LIGHT_INK} seed={7} />
        </div>
        <div className="auth-glow" ref={glowRef}></div>

        <button
          type="button"
          className="theme-toggle"
          onClick={() => setDark((d) => !d)}
        >
          {dark ? "Light ☀" : "Dark ☾"}
        </button>

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

          <div className="card" id="mainCard" ref={cardRef}>
            <div className="auth-sheen" ref={sheenRef}></div>

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
          </div>
        </main>

        <img
          src={authIllustration}
          alt=""
          aria-hidden="true"
          className="auth-illustration"
        />
      </div>
    );
}
