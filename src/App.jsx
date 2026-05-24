import { useState } from 'react'

function computeProb({ fever, tachycardia, crackles, oxygenSat, wbcCount, xrayResult }) {
  let s = 0.18
  if (wbcCount > 20) s += 0.34
  else if (wbcCount > 15) s += 0.24
  else if (wbcCount > 11) s += 0.15
  else if (wbcCount < 4.5) s += 0.03
  if (oxygenSat < 88) s += 0.30
  else if (oxygenSat < 91) s += 0.21
  else if (oxygenSat < 94) s += 0.13
  else if (oxygenSat < 96) s += 0.05
  else s -= 0.04
  if (crackles) s += 0.12
  if (tachycardia) s += 0.09
  if (fever) s += 0.06
  const xray = { consolidation: 0.20, infiltrate: 0.12, opacity: 0.08, effusion: 0.04, normal: -0.06 }
  s += xray[xrayResult] ?? 0
  return Math.max(0.03, Math.min(0.96, s))
}

function getRiskFactors({ fever, tachycardia, crackles, oxygenSat, wbcCount, xrayResult }) {
  const f = []
  if (wbcCount > 11) f.push(`Elevated WBC ${wbcCount.toFixed(1)} ×10³/μL`)
  if (oxygenSat < 94) f.push(`Low SpO₂ ${oxygenSat.toFixed(1)}%`)
  if (crackles) f.push('Crackles on auscultation')
  if (tachycardia) f.push('Tachycardia')
  if (fever) f.push('Fever')
  if (xrayResult !== 'normal') f.push(`X-ray: ${xrayResult}`)
  return f
}

const INIT = { fever: false, tachycardia: false, crackles: false, oxygenSat: 97, wbcCount: 8.0, xrayResult: 'normal' }

export default function App() {
  const [inp, setInp] = useState(INIT)
  const [result, setResult] = useState(null)
  const [going, setGoing] = useState(false)
  const [animated, setAnimated] = useState(false)
  const [about, setAbout] = useState(false)

  const set = (k, v) => setInp(p => ({ ...p, [k]: v }))
  const tog = k => setInp(p => ({ ...p, [k]: !p[k] }))

  function predict() {
    setGoing(true); setResult(null); setAnimated(false)
    setTimeout(() => {
      const prob = computeProb(inp)
      setResult({ prob, isPneu: prob >= 0.35, factors: getRiskFactors(inp) })
      setGoing(false)
      setTimeout(() => setAnimated(true), 60)
    }, 700)
  }

  function reset() { setInp(INIT); setResult(null); setAnimated(false) }

  const prob = result ? Math.round(result.prob * 100) : 0

  const contributions = [
    ['WBC count', inp.wbcCount > 11 ? Math.min((inp.wbcCount - 11) / 10, 1) : 0, inp.wbcCount > 11 ? 'danger' : 'success'],
    ['SpO₂', inp.oxygenSat < 96 ? (96 - inp.oxygenSat) / 16 : 0, inp.oxygenSat < 94 ? 'danger' : 'success'],
    ['Crackles', inp.crackles ? 0.6 : 0, 'danger'],
    ['Tachycardia', inp.tachycardia ? 0.45 : 0, 'danger'],
    ['Fever', inp.fever ? 0.3 : 0, 'warning'],
    ['Chest X-ray', ({ consolidation: 1, infiltrate: 0.6, opacity: 0.4, effusion: 0.2, normal: 0 })[inp.xrayResult] ?? 0,
      inp.xrayResult === 'consolidation' || inp.xrayResult === 'infiltrate' ? 'danger' : 'success']
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-tertiary)', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '1.75rem' }}>
          <div style={{ width: '48px', height: '48px', background: 'var(--color-info-bg)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <i className="ti ti-stethoscope" style={{ fontSize: '24px', color: 'var(--color-info-text)' }} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '600', color: 'var(--color-text)' }}>Pneumonia Risk Predictor</h1>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              ML clinical decision-support · B.Tech CS-106 · Delhi Technological University
            </p>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '1.5rem' }}>
          {[['71%', 'Accuracy'], ['71%', 'Recall'], ['1,500', 'Records'], ['3', 'Models trained']].map(([v, l]) => (
            <div key={l} style={{ background: 'var(--color-bg)', border: '0.5px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '0.875rem 0.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: '600' }}>{v}</div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Form */}
        <div style={{ background: 'var(--color-bg)', border: '0.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '500', margin: '0 0 1.25rem' }}>Enter patient data</h2>

          {/* Symptom toggles */}
          <div style={{ marginBottom: '1.25rem' }}>
            <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: '0 0 0.625rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Symptoms</p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[['fever', 'Fever', 'ti-thermometer'], ['tachycardia', 'Tachycardia', 'ti-activity'], ['crackles', 'Crackles', 'ti-ear']].map(([k, label, icon]) => (
                <button key={k} onClick={() => tog(k)} style={{
                  display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 15px', fontSize: '14px',
                  border: `0.5px solid ${inp[k] ? 'var(--color-info-border)' : 'var(--color-border-strong)'}`,
                  borderRadius: 'var(--radius-md)',
                  background: inp[k] ? 'var(--color-info-bg)' : 'transparent',
                  color: inp[k] ? 'var(--color-info-text)' : 'var(--color-text)', cursor: 'pointer'
                }}>
                  <i className={`ti ${icon}`} style={{ fontSize: '15px' }} />
                  {label}
                  {inp[k] && <i className="ti ti-check" style={{ fontSize: '13px' }} />}
                </button>
              ))}
            </div>
          </div>

          {/* Sliders */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                <span><i className="ti ti-lungs" style={{ fontSize: '13px', verticalAlign: '-1px', marginRight: '4px' }} />SpO₂ (%)</span>
                <span style={{ fontWeight: '500', color: inp.oxygenSat < 94 ? 'var(--color-danger-text)' : inp.oxygenSat < 96 ? 'var(--color-warning-text)' : 'var(--color-success-text)' }}>
                  {inp.oxygenSat.toFixed(1)}%
                </span>
              </div>
              <input type="range" min="80" max="100" step="0.5" value={inp.oxygenSat}
                onChange={e => set('oxygenSat', parseFloat(e.target.value))} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: '3px' }}>
                <span>80</span><span>Normal ≥ 95%</span><span>100</span>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                <span><i className="ti ti-microscope" style={{ fontSize: '13px', verticalAlign: '-1px', marginRight: '4px' }} />WBC (×10³/μL)</span>
                <span style={{ fontWeight: '500', color: inp.wbcCount > 11 ? 'var(--color-danger-text)' : inp.wbcCount < 4.5 ? 'var(--color-warning-text)' : 'var(--color-success-text)' }}>
                  {inp.wbcCount.toFixed(1)}
                </span>
              </div>
              <input type="range" min="1" max="30" step="0.5" value={inp.wbcCount}
                onChange={e => set('wbcCount', parseFloat(e.target.value))} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: '3px' }}>
                <span>1</span><span>Normal 4.5–11</span><span>30</span>
              </div>
            </div>
          </div>

          {/* X-ray */}
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: '0 0 0.625rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              <i className="ti ti-scan" style={{ fontSize: '13px', verticalAlign: '-1px', marginRight: '4px' }} />
              Chest X-ray finding
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '7px' }}>
              {[['normal', 'Normal', 'success'], ['effusion', 'Effusion', 'warning'], ['opacity', 'Opacity', 'warning'], ['infiltrate', 'Infiltrate', 'danger'], ['consolidation', 'Consolidation', 'danger']].map(([v, l, col]) => (
                <button key={v} onClick={() => set('xrayResult', v)} style={{
                  padding: '8px 4px', fontSize: '12px', textAlign: 'center', cursor: 'pointer',
                  border: inp.xrayResult === v ? `1.5px solid var(--color-${col}-border)` : '0.5px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  background: inp.xrayResult === v ? `var(--color-${col}-bg)` : 'transparent',
                  color: inp.xrayResult === v ? `var(--color-${col}-text)` : 'var(--color-text-secondary)'
                }}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={predict} disabled={going} style={{
              flex: 1, padding: '11px', fontSize: '15px', fontWeight: '500',
              border: '0.5px solid var(--color-info-border)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-info-bg)', color: 'var(--color-info-text)',
              cursor: going ? 'not-allowed' : 'pointer'
            }}>
              <i className={`ti ${going ? 'ti-loader' : 'ti-brain'}`} style={{ fontSize: '16px', verticalAlign: '-2px', marginRight: '8px' }} />
              {going ? 'Analysing...' : 'Run Prediction'}
            </button>
            <button onClick={reset} style={{
              padding: '11px 16px', border: '0.5px solid var(--color-border-strong)',
              borderRadius: 'var(--radius-md)', background: 'transparent', color: 'var(--color-text-secondary)', cursor: 'pointer'
            }}>
              <i className="ti ti-refresh" style={{ fontSize: '16px', verticalAlign: '-2px' }} />
            </button>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div style={{
            background: 'var(--color-bg)',
            border: `0.5px solid ${result.isPneu ? 'var(--color-danger-border)' : 'var(--color-success-border)'}`,
            borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '1.25rem' }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '50%', flexShrink: 0,
                background: result.isPneu ? 'var(--color-danger-bg)' : 'var(--color-success-bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <i className={`ti ${result.isPneu ? 'ti-alert-triangle' : 'ti-circle-check'}`}
                  style={{ fontSize: '26px', color: result.isPneu ? 'var(--color-danger-text)' : 'var(--color-success-text)' }} />
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: '600', color: result.isPneu ? 'var(--color-danger-text)' : 'var(--color-success-text)' }}>
                  {result.isPneu ? 'Pneumonia risk detected' : 'Low pneumonia risk'}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                  Gradient Boosting · decision threshold 0.35
                </div>
              </div>
            </div>

            {/* Probability bar */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Pneumonia probability</span>
                <span style={{ fontSize: '24px', fontWeight: '600' }}>{prob}%</span>
              </div>
              <div style={{ height: '14px', borderRadius: '99px', background: 'var(--color-bg-secondary)', position: 'relative', overflow: 'visible' }}>
                <div style={{ position: 'absolute', left: '35%', top: '-6px', bottom: '-6px', width: '2px', background: 'var(--color-border-strong)', borderRadius: '2px', zIndex: 2 }} />
                <div style={{
                  height: '100%', borderRadius: '99px', position: 'relative', zIndex: 1,
                  width: animated ? `${prob}%` : '0%',
                  background: result.isPneu ? 'var(--color-danger-text)' : 'var(--color-success-text)',
                  transition: 'width 0.7s cubic-bezier(0.34,1.56,0.64,1)'
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                <span>0%</span><span>▲ threshold 35%</span><span>100%</span>
              </div>
            </div>

            {/* Feature contributions */}
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '0 0 8px' }}>Feature contributions</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {contributions.map(([name, val, col]) => (
                  <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', width: '90px', flexShrink: 0 }}>{name}</span>
                    <div style={{ flex: 1, height: '7px', background: 'var(--color-bg-secondary)', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: '99px',
                        width: animated ? `${Math.round(val * 100)}%` : '0%',
                        background: `var(--color-${col}-text)`,
                        transition: 'width 0.7s cubic-bezier(0.34,1.56,0.64,1)'
                      }} />
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', width: '32px', textAlign: 'right' }}>
                      {Math.round(val * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk factors */}
            <div style={{ background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-md)', padding: '0.875rem', fontSize: '13px', marginBottom: '0.875rem' }}>
              <span style={{ fontWeight: '500' }}>Risk factors: </span>
              <span style={{ color: 'var(--color-text-secondary)' }}>
                {result.factors.length > 0 ? result.factors.join(' · ') : 'None identified'}
              </span>
            </div>

            <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-tertiary)', lineHeight: '1.5' }}>
              Research demo only — not for clinical use. Approximates the trained Gradient Boosting classifier using published feature importances. Clinical decisions require qualified healthcare professionals.
            </p>
          </div>
        )}

        {/* About */}
        <div style={{ background: 'var(--color-bg)', border: '0.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <button onClick={() => setAbout(!about)} style={{
            width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '1rem 1.25rem', background: 'var(--color-bg-secondary)', border: 'none',
            cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: 'var(--color-text)'
          }}>
            About this project
            <i className={`ti ${about ? 'ti-chevron-up' : 'ti-chevron-down'}`} style={{ fontSize: '16px' }} />
          </button>
          {about && (
            <div style={{ padding: '1.25rem', fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.7' }}>
              <p style={{ margin: '0 0 0.75rem' }}>
                Built for the Basic Machine Learning course (CS-106) at Delhi Technological University. Three classifiers were compared — Logistic Regression, Random Forest, and Gradient Boosting — on 1,500 simulated clinical records across three diagnostic classes (pneumonia, pulmonary oedema, atelectasis).
              </p>
              <p style={{ margin: '0 0 0.875rem' }}>
                Gradient Boosting achieved the best baseline accuracy (73%). The decision threshold was tuned from 0.5 → 0.35 to prioritise recall over precision, yielding 71% accuracy with 71% pneumonia recall. WBC count and SpO₂ were identified as the two strongest predictors via Random Forest feature importance analysis.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '0.875rem' }}>
                {['Python', 'Scikit-learn', 'Pandas', 'Matplotlib', 'Seaborn'].map(t => (
                  <span key={t} style={{ fontSize: '12px', padding: '3px 10px', background: 'var(--color-info-bg)', color: 'var(--color-info-text)', borderRadius: '99px' }}>{t}</span>
                ))}
              </div>
              <p style={{ margin: 0, fontSize: '12px' }}>Authors: Ved Bhartwal · Wagesh Sharma · Bishal Prasad Yadav · Submitted to: Asst. Prof. Anshika Arora</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
