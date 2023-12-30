import Cookies from 'js-cookie';

const TOKEN_COOKIE_NAME = 'access_token';

export const setAccessTokenCookie = (token: string) => {
  // 30日の期限をセット
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 30);

  // Cookieに保存
  Cookies.set(TOKEN_COOKIE_NAME, token, { expires: expirationDate });
};

export const getAccessTokenCookie = () => {
  // Cookieからアクセストークンを取得
  return Cookies.get(TOKEN_COOKIE_NAME);
};

export const removeAccessTokenCookie = () => {
  // Cookieからアクセストークンを削除
  Cookies.remove(TOKEN_COOKIE_NAME);
};
