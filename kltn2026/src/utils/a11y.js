/** Keyboard activation for elements with role="button" (Enter / Space). */
const onActivationKeyDown = (handler) => (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handler(event);
  }
};

/** Backdrop / dismissible overlay — click + keyboard. */
export const backdropA11yProps = (onClose, label = 'Đóng') => ({
  role: 'button',
  tabIndex: 0,
  'aria-label': label,
  onClick: (e) => {
    if (e.target === e.currentTarget) onClose(e);
  },
  onKeyDown: onActivationKeyDown(onClose),
});

/** Clickable card / list row — use when a div must stay a div for layout. */
export const interactiveDivProps = (onActivate, label) => ({
  role: 'button',
  tabIndex: 0,
  ...(label ? { 'aria-label': label } : {}),
  onClick: onActivate,
  onKeyDown: onActivationKeyDown(onActivate),
});
