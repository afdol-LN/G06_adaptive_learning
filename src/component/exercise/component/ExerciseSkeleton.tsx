import AppBrand from '../../common/AppBrand';
import { usePreferences } from '../../../context/PreferencesContext';

// Placeholder shaped like the real Exercise screen (topbar, Progress, QuestionCard), shown while
// /session/start is loading so the page doesn't jump when the question arrives. Styles: Exercise.css .ex-sk*
export default function ExerciseSkeleton() {
  const { t } = usePreferences();

  return (
    <div className="wrap" role="status" aria-busy="true">
      <span className="ex-sk-sr">{t('exercise.loading')}</span>

      <div className="topbar" aria-hidden>
        <AppBrand variant="topbar" />
        <div className="topbar-r">
          <span className="ex-sk ex-sk-btn" />
          <span className="ex-sk ex-sk-btn" />
          <span className="ex-sk ex-sk-chip" />
        </div>
      </div>

      <div className="prog-area" aria-hidden>
        <div className="prog-row">
          <span className="ex-sk ex-sk-line" style={{ width: 90 }} />
          <span className="ex-sk ex-sk-line" style={{ width: 160 }} />
          <div className="prog-spacer"></div>
          <span className="ex-sk ex-sk-line" style={{ width: 64 }} />
        </div>
        <span className="ex-sk ex-sk-track" />
      </div>

      <div className="stage" aria-hidden>
        <div className="qc-card ex-sk-card">
          <div className="qc-head">
            <div className="qc-head-l">
              <span className="ex-sk ex-sk-line" style={{ width: 70 }} />
              <span className="ex-sk ex-sk-pill" style={{ width: 120 }} />
            </div>
            <span className="ex-sk ex-sk-pill" style={{ width: 72 }} />
          </div>
          <div className="qc-body">
            <div className="ex-sk-question">
              <span className="ex-sk ex-sk-line" style={{ width: '85%' }} />
              <span className="ex-sk ex-sk-line" style={{ width: '60%' }} />
            </div>
            <div className="qc-choices">
              {[78, 64, 70, 52].map((w, i) => (
                <div key={i} className="ex-sk-choice">
                  <span className="ex-sk ex-sk-letter" />
                  <span className="ex-sk ex-sk-line" style={{ width: `${w}%` }} />
                </div>
              ))}
            </div>
          </div>
          <div className="qc-foot">
            <span className="ex-sk ex-sk-submit" />
          </div>
        </div>
      </div>
    </div>
  );
}
