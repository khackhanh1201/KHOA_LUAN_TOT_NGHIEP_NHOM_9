const rdStyleDisplayAlignItemsGap = {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontSize: 12,
      fontWeight: 800,
      color: colors.primary,
      marginBottom: 16,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    };

import React from 'react';
import { colors } from '../../theme/designTokens';

export const InfoData = ({ label, value }) => (
  <div>
    <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 800, marginBottom: 4, textTransform: 'uppercase' }}>{label}</div>
    <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{value}</div>
  </div>
);

export const SectionTitle = ({ icon, title }) => (
  <div
    style={rdStyleDisplayAlignItemsGap}
  >
    <i className={`bi bi-${icon}`}></i> {title}
  </div>
);
