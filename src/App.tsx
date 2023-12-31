import './App.css'
import { DriveModule as DriveModule } from "./components/DriveModule";
import { useState } from 'react';
import { IsError } from './components/error';
import { removeAccessTokenCookie } from './cookieUtil';

const driveModule = new DriveModule();

function App() {

    // 処理中か否か
    // 処理中は追加でリクエストを飛ばさないようにする
    const [isBusy, setIsBusy] = useState<boolean>(false);

    /************** Key, Value ペアを保存する **************/
    // 保存するKey, Value ペア
    const [settingKey, setSetingKey] = useState<string>(""); 
    const [settingValue, setSetingValue] = useState<string>("");

    // setボタンの挙動
    async function onSet() {
        setIsBusy(true);
        const res = await driveModule.setItem(settingKey, settingValue);
        if (IsError(res)) setSetingValue(res.title);
        setIsBusy(false);
    }

    /************** KeyからValueを取得する **************/
    // 取得するKey, 取得したValue
    const [gettingKey, setGettingKey] = useState<string>("");
    const [gotValue, setGotValue] = useState<string>("");

    // getボタンの挙動
    async function onGet() {
        setIsBusy(true); 
        const res = await driveModule.getItem(gettingKey);
        if (IsError(res)) setGotValue(res.title);
        else if (res == undefined) setGotValue("undefined");
        else setGotValue(res);
        setIsBusy(false);
    }

    /************** Keyを削除する **************/

    // 削除するKey、削除結果
    const [removingKey, setRemovingKey] = useState<string>("");
    const [removeResult, setRemoveResult] = useState<string>("");

    // removeボタンの挙動
    async function onRemove() {
        setIsBusy(true);
        const res = await driveModule.removeItem(removingKey);
        if (IsError(res)) setRemoveResult(res.title);
        else setRemoveResult(res.toString());
        setIsBusy(false);
    }

    /************** アカウント削除 ******************/

    const [deleteAccountRes, setDeleteAccountRes] = useState<string>("");

    async function onDeleteAccount(){
        setIsBusy(true);
        const res = await driveModule.deleteAccount();
        if (IsError(res)) setDeleteAccountRes(res.title);
        else setDeleteAccountRes("done");
        setIsBusy(false);
    }

    return (
        <>
            <div>
                <table>
                    <tbody>
                        {/* ヘッダー */}
                        <tr>
                            <td>key</td>
                            <td>value</td>
                            <td>実行ボタン</td>
                        </tr>

                        {/* set */}
                        <tr>
                            <td><input onChange={e => setSetingKey(e.target.value)} /></td>
                            <td><input onChange={e => setSetingValue(e.target.value)} /></td>
                            <td><button disabled={isBusy} onClick={()=>onSet()}>set</button></td>
                        </tr>

                        {/* get */}
                        <tr>
                            <td><input onChange={e => setGettingKey(e.target.value)} /></td>
                            <td>{gotValue}</td>
                            <td><button disabled={isBusy} onClick={()=>onGet()}>get</button></td>
                        </tr>

                        {/* remove */}
                        <tr>
                            <td><input onChange={e => setRemovingKey(e.target.value)} /></td>
                            <td>{removeResult}</td>
                            <td><button disabled={isBusy} onClick={()=>onRemove()}>remove</button></td>
                        </tr>

                        {/* delete account */}
                        <tr>
                            <td></td>
                            <td>{deleteAccountRes}</td>
                            <td><button disabled={isBusy} onClick={()=>onDeleteAccount()}>delete account</button></td>
                        </tr>

                    </tbody>
                </table>


            </div>
        </>
    )
}



export default App


