export interface UserInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export type CustomAppEnv = {
  Variables: {
    user?: UserInfo;
  };
};
