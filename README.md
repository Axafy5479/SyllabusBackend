# 概要
key-value ペアをクラウド(google driveのappdataスペース)上に保存するモジュールです。local storageと同様の手触りで使用できるようなインターフェースを作成しました。

シ楽バスのユーザーデータをクラウド上に保存することを目標に作成しました。

# demo
https://syllabusbackend.onrender.com/

![image](https://github.com/FraMari495/SyllabusBackend/assets/48946038/f6f14321-f5bf-47bd-949a-c765abead742)

最上段のkeyとvalueフィールドに何か入力しsetボタンをクリックすることでkey-valueペアが保存されます。
中段は保存されたkey-valueペアを検索することができます。
下段はkeyを指定してデータを削除することができます。keyが存在し正しく削除された場合はtrue、削除できなかった場合はfalseが表示されます。

### このdemoのデータを削除する
https://drive.google.com/drive/settings

にアクセスし、SyllabusBackendをドライブから切断してください。
![image](https://github.com/FraMari495/SyllabusBackend/assets/48946038/48acc63d-d2d0-4e05-bc66-60e6a2cefe7c)


# Auth
key-valueペアはシリアル化され、ユーザーのgoogle driveのappDataFolder下に保存します。このサービスがユーザーのドライブにアクセスすることを承認してもらうためOAuthの手順を踏ます。
この際、このサービスがユーザーデータのどこまでアクセスする予定かを示す必要があります。この範囲(スコープ)はauth/drive.appdataに設定しており、サービス専用のフォルダをユーザーのGoogleドライブに作成することが可能になります。

![image](https://github.com/FraMari495/SyllabusBackend/assets/48946038/7480306b-5398-4f4f-80e1-dd9db46cbe4d)

このスコープは「非機密のスコープ」に分類されておりリリースの際Googleの審査を受ける必要がない一方、専用フォルダの外(例えばマイドライブ)にアクセスすることはできません。

# モジュールの仕様
`DriveModule`クラスに主要なメソッドが定義されています。
- `async setItem(key: string, value: string): Promise<void|err.ErrorInfo>`
key, valueのペアを保存する非同期メソッドです。例外が発生した場合は`ErrorInfo`のインスタンスが返ります。keyを空文字にすることはできません(`ErrorInfo`インスタンスが返ります)。
- `async getItem(key: string): Promise<string | undefined | err.ErrorInfo>`
keyを指定してvalueを取得する非同期メソッドです。keyが存在した場合は結果が文字列で返されます。存在しない場合は`undefined`、例外が発生した場合は`ErrorInfo`のインスタンスが返ります。
- `async removeItem(key:string): Promise<boolean|err.ErrorInfo>`
keyを指定してkey, valueペアを削除する非同期メソッドです。keyが存在した場合は削除し`true`を、存在しない場合は何もせず`false`を返します。エラーの場合は`ErrorInfo`のインスタンスを返します。
- `async clear(): Promise<void|err.ErrorInfo>`
ユーザーデータのファイルを削除する非同期メソッドです。
`ErrorInfo`の型ガードには`IsError`関数を利用してください。

　実際の利用はsrc/App.tsxを参考にして頂けたらと思います。

# Cookie
30日の期限を設けています。

