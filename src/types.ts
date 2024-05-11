export type UserAmount = {
  name: string;
  amount: number;
};

export type Record = {
  id: string;
  date: string;
  name: string;
  amount: number;
  detail: string;
};

export const Keys = {
  CREATE_TSUKE_ACTION: "create-tsuke-action",
  CREATE_SETTLE_ACTION: "create-settle-action",
  EXEC_CREATE: "exec-create",
  DELETE_ACTION: "delete-action",
  EXEC_DELETE: "exec-delete",
  TSUKE: "tsuke",
  SETTLE: "settle",
};
