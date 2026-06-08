import React from 'react';
import { STEPS } from './submitDeclarationUtils';

const stepCircleStyle = (currentStep, stepId) => ({
  width: 38,
  height: 38,
  borderRadius: '50%',
  background: currentStep >= stepId ? '#a30d11' : '#e2e8f0',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 700,
});

const DeclarationStepper = ({ step }) => (
  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
    {STEPS.map((s, i) => (
      <React.Fragment key={s.id}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={stepCircleStyle(step, s.id)}>
            {step > s.id ? '✓' : s.id}
          </div>
          <span style={{ marginTop: 8, fontSize: 12, fontWeight: 700, color: step >= s.id ? '#a30d11' : '#94a3b8' }}>
            {s.label}
          </span>
        </div>
        {i < STEPS.length - 1 && (
          <div style={{ flex: 1, height: 3, background: step > s.id ? '#a30d11' : '#e2e8f0', margin: '18px 20px 0' }} />
        )}
      </React.Fragment>
    ))}
  </div>
);

export default DeclarationStepper;
