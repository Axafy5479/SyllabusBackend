import { AuthModule } from "./AuthModule";

export type SaveFileInfo = {
    fileId: string,
    content: { [key: string]: string },
}

export class DriveModule {
    public constructor() {
        this.authModule = new AuthModule();
    }

    private authModule: AuthModule;
    private FILE_NAME: string = "userData.json";

    public isBusy = false;

    /**
     * SyllabusプロジェクトのAppDataファイルを全て取得する
     * @returns 全てのAppDataファイル
     */
    private async getAllAppDataFiles(): Promise<gapi.client.drive.File[]> {
        const drive = await this.authModule.GoogleDrive();
        const res = await drive.files.list({ spaces: "appDataFolder" });
        return res.result.files ?? [];
    }

    /**
     * ユーザーデータファイルを取得
     */
    private async getUserDataFile(): Promise<gapi.client.drive.File | undefined> {
        const files = await this.getAllAppDataFiles();
        return files.find(f => f.name == this.FILE_NAME);
    }

    /**
     * セーブを行う
     * @param content セーブしたい内容
     */
    public async setItem(key: string, content: string) {
        this.isBusy = true;
        try {
            let saveData = await this.getUserData();
            if (saveData == null) {
                const userFile = await this.createFile();
                saveData = { fileId: userFile.id!, content: {} };
            }
            saveData.content[key] = content;
            await this.updateFile(saveData);
        } catch (err) {
            console.error("データの保存に失敗しました");
            console.error(err);
        }
        this.isBusy = false;
    }

    /**
     * AppDataフォルダ内にファイルを作成する
     * @returns 作成したファイル
     */
    private async createFile(): Promise<gapi.client.drive.File> {
        const fileMetadata = {
            name: this.FILE_NAME, // ファイル名
            parents: ['appDataFolder'], // appdata領域への指定
            mimeType: "text/plain",
        };
        const drive = await this.authModule.GoogleDrive();
        const res = await drive.files.create({
            resource: fileMetadata
        })
        return res.result;
    }

    /**
     * ファイル内容を上書きする
     * @param fileId 上書きするファイルのId
     * @param content 保存したい内容
     */
    private async updateFile(saveFileInfo: SaveFileInfo) {
        const blob = new Blob([JSON.stringify(saveFileInfo.content)], { type: 'text/plain' });
        await fetch(`https://www.googleapis.com/upload/drive/v3/files/${saveFileInfo.fileId}`, {
            method: 'PATCH',
            headers: new Headers({
                'Authorization': `Bearer ${gapi.client.getToken().access_token}`,
                'Content-Type': 'text/plain'
            }),
            body: blob
        });
    }

    /**
     * userDataを取得
     * @returns userDataの内容
     */
    private async getUserData(): Promise<SaveFileInfo | null> {

        const file = await this.getUserDataFile();
        if (file == null) return null;
        const fileId = file.id!;
        const drive = await this.authModule.GoogleDrive();
        const res = await drive.files.get({ fileId: fileId, alt: "media" });
        return { fileId: fileId, content: JSON.parse(res.body) };

    }


    /**
     * userDataを取得
     * @returns userDataの内容
     */
    public async getItem(key: string): Promise<string | null> {
        try {
            this.isBusy = true;
            const file = await this.getUserData();
            if (file == null) return null;
            this.isBusy = false;
            return file.content[key];
        } catch (err) {
            console.error("データの取得に失敗しました");
            console.error(err);
            return null;
        }
    }

    /**
     * userDataを取得
     * @returns userDataの内容
     */
    public async deleteItem(): Promise<void> {
        try {
            this.isBusy = true;
            const driveModule = await this.authModule.GoogleDrive();
            const file = await this.getUserDataFile();
            if (file == null) return;
            await driveModule.files.delete({ fileId: file.id! });
            this.isBusy = false;
        } catch (err) {
            console.error("データの削除に失敗しました");
            console.error(err);
        }
    }
}
