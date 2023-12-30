import waitUntil from "async-wait-until";

/**
 * google authを行うモジュール
 */
export class AuthModule {
    failedToAuth = false;

    private async initialize() {
        this.failedToAuth = false;
        this.addScriptElement("https://apis.google.com/js/api.js", () => {
            this.gapiLoaded(() => { this.failedToAuth = true; console.log("apiのロードに失敗しました。"); });
        })
        this.addScriptElement("https://accounts.google.com/gsi/client", () => {
            this.gisLoaded(() => { this.failedToAuth = true; console.log("認証に失敗しました。"); });
        });

        // どちらもロードされるまで待機
        await waitUntil(() => this.gisInited && this.gapiInited || this.failedToAuth, { timeout: 1000000 });
        if (this.failedToAuth) return;
        console.log("wait for auth");

        // Auth
        this.signin();

        // 完了するまで待機
        await waitUntil(() => this.hasTokenObtained || this.failedToAuth, { timeout: 1000000 });
    }

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
    private discoveryDoc = [
        "https://script.googleapis.com/$discovery/rest?version=v1",
        "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"
    ];

    /**
     * Google Identity Services (???)のロード完了のコールバック関数
     * initTokenClient(???)の初期化を行う
     */
    private gisLoaded(onError: () => void) {
        this.tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: import.meta.env.VITE_CLIENT_ID,
            scope: import.meta.env.VITE_SCOPES,
            callback: _ => this.hasTokenObtained = true,
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
                discoveryDocs: this.discoveryDoc,
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


    /**
     * アクセストークンが取得済みか否か
     */
    public hasTokenObtained = false;

    /**
     * google driveのapiを返す
     */
    public async GoogleDrive() {
        if (!this.gapiInited || !this.gisInited || gapi.client.getToken() == null) {
            await this.initialize();
        }
        return gapi.client.drive;
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