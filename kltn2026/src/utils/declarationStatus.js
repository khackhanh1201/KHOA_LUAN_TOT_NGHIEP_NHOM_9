/** Trạng thái hiển thị ở tab "Chờ xử lý" (PropertyDeclarationPage). */
const PENDING_DECLARATION_STATUSES = ['PENDING', 'SUBMITTED', 'Chờ duyệt'];

const getDeclarationStatus = (item) =>
  item?.status ?? item?.currentStatus ?? '';

export const isPendingDeclaration = (item) =>
  PENDING_DECLARATION_STATUSES.includes(getDeclarationStatus(item));

export const countPendingDeclarations = (items) =>
  (Array.isArray(items) ? items : []).filter(isPendingDeclaration).length;
