import waitUntil from "async-wait-until";
import * as err from "./error";
import { getAccessTokenCookie, setAccessTokenCookie } from "../cookieUtil";

/**
 * google authを行うモジュール
 */
export class AuthModule {
    failedToLoadModule = { hasError: false, message: "" };

    private async initialize() {
        this.failedToLoadModule = { hasError: false, message: "" };

        if (!this.gapiInited) {
            this.addScriptElement("https://apis.google.com/js/api.js", () => {
                this.gapiLoaded((err) => this.failedToLoadModule = { hasError: true, message: err });
            })
        }

        if (!this.gisInited) {
            this.addScriptElement("https://accounts.google.com/gsi/client", () => {
                this.gisLoaded((err) => this.failedToLoadModule = { hasError: true, message: err });
            });
        }

        // どちらもロードされるまで待機
        await waitUntil(() => this.gisInited && this.gapiInited || this.failedToLoadModule.hasError, { timeout: 1000000 });
        if (this.failedToLoadModule.hasError) return;

        if (gapi.client.getToken() == null) {
            // Auth
            this.signin();
        }

        // 完了するまで待機
        await waitUntil(() => this.hasTokenObtained || this.failedToLoadModule.hasError, { timeout: 1000000 });
    }

    /**
     * 外部モジュールは import で読み込めない
     * そのため、htmlに<script/>要素を追加してモジュールをロードする
     * @param url 外部モジュールのurl
     * @param onloaded 外部モジュールがロードされた時に呼ばれるコールバックメソッド
     */
    private addScriptElement(url: string, onloaded: () => void) {

        // <script />要素作成
        const script_gapi = document.createElement("script");

        // urlを指定して外部スクリプトをロードする
        // import from では外部スクリプトをロードすることができない
        script_gapi.src = url;

        // ロードが完了したらthis.gapiLoaded()を呼ぶ
        script_gapi.onload = onloaded;

        // script要素をhtmlに追加する
        document.body.appendChild(script_gapi);
    }

    private tokenClient: google.accounts.oauth2.TokenClient | null = null;

    // gis, gapiの二つの外部モジュールを使用することでgoogle apiを呼び出す。
    // これらがロードされたか否かを表すフラグ
    private gisInited = false;
    private gapiInited = false;

    // gapiのロード時に同時に読み込むスクリプト
    private static DiscoveryDoc = [
        "https://script.googleapis.com/$discovery/rest?version=v1",
        "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"
    ];

    /**
     * Google Identity Services (???)のロード完了のコールバック関数
     * initTokenClient(???)の初期化を行う
     */
    private gisLoaded(onError: (err: any) => void) {
        this.tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: import.meta.env.VITE_CLIENT_ID,
            scope: import.meta.env.VITE_SCOPES,
            callback: tokenRes => {
                // トークンの期限
                const expires_in = Number.parseInt(tokenRes.expires_in);

                // 期限 - 6分をクッキーの期限に設定
                setAccessTokenCookie(tokenRes.access_token,expires_in - 360);
                this.hasTokenObtained = true;
            },
            error_callback: onError,
        });
        this.gisInited = true;
    }


    /**
     * googleのサービスのAPIを叩くモジュール(api.js)のロード完了のコールバック関数
     * initializeGapiClientを呼び、gapi.clientの初期化を行う
     */
    private gapiLoaded(onError: (err: any) => void) {
        gapi.load('client', () => this.initializeGapiClient(onError));
    }

    /**
     * API clientが初期化された際のコールバックメソッド. 
     * discovery doc を読み込む
     */
    private async initializeGapiClient(onError: (err: any) => void) {
        try {
            await gapi.client.init({
                apiKey: import.meta.env.VITE_API_KEY,
                discoveryDocs: AuthModule.DiscoveryDoc,
            });
            this.gapiInited = true;
        } catch (err) {
            onError(err);
        }
    }

    /**
     *  SignInボタンがクリックされた時の挙動
     */
    private signin() {

        const tokenCookie = getAccessTokenCookie();
        if (tokenCookie != undefined) {
            gapi.client.setToken({ access_token: tokenCookie });
            this.hasTokenObtained = true;
        } else {
            if (this.tokenClient != null) {
                // すでにトークンを取得済みか否かで場合わけ
                if (gapi.client.getToken() == null) {
                    // 持っていない場合は新しく取得
                    this.tokenClient.requestAccessToken({ prompt: 'consent' });
                } else {
                    // 持っている場合はスキップ
                    this.tokenClient.requestAccessToken({ prompt: '' });
                }
            }
        }
    }


    /**
     * アクセストークンが取得済みか否か
     */
    public hasTokenObtained = false;

    /**
     * google driveのapiを返す
     */
    public async auth(): Promise<err.ErrorInfo | null> {
        const hasToken = getAccessTokenCookie()!=null;
        if (!this.gapiInited || !this.gisInited) {
            await this.initialize();
        }else if(!hasToken){
            this.hasTokenObtained = false;
            this.signin();
            await waitUntil(()=>this.hasTokenObtained);
        }

        if (this.failedToLoadModule.hasError) {
            return err.Err_LoadModule(this.failedToLoadModule.message);
        }
        return null;
    }

    /**
     *  Sign out the user upon button click.
     */
    public signout() {
        const token = gapi.client.getToken();
        if (token !== null) {
            google.accounts.oauth2.revoke(token.access_token, () => {
                this.hasTokenObtained = false;
            });
            gapi.client.setToken(null);
        }
    }
}