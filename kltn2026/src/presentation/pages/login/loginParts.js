export const loginReducer = (state, action) => {
  switch (action.type) {
    case 'PATCH':
      return { ...state, ...action.payload };
    case 'RESET_ERRORS':
      return { ...state, loginError: '', accountStatusBlock: null };
    default:
      return state;
  }
};

export const activationReducer = (state, action) => {
  switch (action.type) {
    case 'PATCH':
      return { ...state, ...action.payload };
    case 'RESET_FORM':
      return {
        ...state,
        cccdNumber: action.prefillCccd ?? '',
        phoneNumber: '',
        email: '',
        otpCode: '',
        newPassword: '',
        maskedEmail: '',
        activationStep: 1,
        activationMessage: '',
        activationError: '',
      };
    default:
      return state;
  }
};

export const qrReducer = (state, action) => {
  switch (action.type) {
    case 'PATCH':
      return { ...state, ...action.payload };
    case 'START_GENERATE':
      return { qrPhase: 'generating', qrBase64: '', qrToken: '', qrError: '' };
    default:
      return state;
  }
};

export const loginStyles = {
  container: {
    backgroundImage: `url('https://cdn-media.sforum.vn/storage/app/media/mylinh/hinh-nen-powerpoint-trong-dong-hoa-sen-36.jpg')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
  },
  card: {
    maxWidth: '850px',
    width: '100%',
    borderRadius: '20px',
  },
  btnRed: {
    backgroundColor: '#bb1a20',
    border: 'none',
  },
};
