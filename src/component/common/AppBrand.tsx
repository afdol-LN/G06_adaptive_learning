import AppLogo from "./AppLogo";

// The project's short name, shown next to the logo in every topbar / sidebar
export const APP_SHORT_NAME = "G06 · ALS";
const APP_SUBTITLE = "Adaptive Learning";

type AppBrandVariant = "topbar" | "sidebar" | "admin";

interface AppBrandProps {
  /** where the brand sits — each variant keeps the classes its screen's stylesheet already styles:
   *  topbar = Exercise.css (.logo), sidebar = Home.css (.sb-header), admin = Adminhome.css (.ad-sidebar-head) */
  variant: AppBrandVariant;
  /** admin only: the small role badge under the name */
  badge?: string;
  /** data-tour anchor for a guided tour step */
  tourId?: string;
}

// Logo + project name. Use this instead of writing <AppLogo /> + "G06 · ALS" by hand in each screen.
export default function AppBrand({ variant, badge, tourId }: AppBrandProps) {
  if (variant === "sidebar") {
    return (
      <div className="sb-header" data-tour={tourId}>
        <div className="sb-brand-icon"><AppLogo /></div>
        <span className="sb-brand sb-label">{APP_SHORT_NAME}</span>
      </div>
    );
  }

  if (variant === "admin") {
    return (
      <div className="ad-sidebar-head" data-tour={tourId}>
        <div className="ad-nav-icon"><AppLogo /></div>
        <div className="ad-sidebar-brand-text">
          <span className="ad-nav-brand">{APP_SHORT_NAME}</span>
          {badge && <span className="ad-nav-badge">{badge}</span>}
        </div>
      </div>
    );
  }

  return (
    <div className="logo" data-tour={tourId}>
      <div className="logo-box"><AppLogo /></div>
      <span className="logo-txt">{APP_SHORT_NAME}</span>
      <div className="logo-dot"></div>
      <span className="logo-sub">{APP_SUBTITLE}</span>
    </div>
  );
}
