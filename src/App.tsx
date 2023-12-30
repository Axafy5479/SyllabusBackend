import { useState } from 'react'
import './App.css'
import {DriveModule as DriveModule} from "./components/DriveModule";
import { KeyValueForm } from './components/keyValueForm';
import { KeyForm } from './components/keyForm';

function App() {

    const [isBusy,setIsBusy] = useState<boolean>(false);

    const driveModule = new DriveModule();

    return (
        <>
        <div>
            <table>
        <tbody>
          <tr key={0}>
            <td  key={0} style={{width:"100px"}}>key</td>
            <td  key={1} style={{width:"100px"}}>value</td>
            <td  key={2} style={{width:"100px"}}>実行ボタン</td>
          </tr>
          <KeyValueForm key={1} buttonTitle='setItem' onClick={(k,v)=>driveModule.setItem(k,v)}></KeyValueForm>
            <KeyForm key={2} buttonTitle='getItem' onClick={key=>driveModule.getItem(key)}></KeyForm>
            <tr>
                <td></td>
                <td></td>
                <td> <button onClick={()=>{
                    setIsBusy(true);
                    driveModule.deleteItem().then(_=>setIsBusy(true));
                }} disabled={isBusy}>delete</button></td>
            </tr>
        </tbody>
      </table>


        </div></>
    )
}



export default App


