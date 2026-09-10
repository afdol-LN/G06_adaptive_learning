import logo from "../../assets/logo-adt-learning.png";
import "../decorate/AppLogo.css";

interface AppLogoProps {
  className?: string;
  alt?: string;
}

// โลโก้โปรเจกต์ — ทุกหน้าจอใช้ component นี้ที่เดียว ขนาดถูกกำหนดโดยกล่องที่ครอบอยู่
export default function AppLogo({ className = "", alt = "" }: AppLogoProps) {
  return (
    <img
      src={logo}
      alt={alt}
      className={`app-logo ${className}`.trim()}
      draggable={false}
    />
  );
}
