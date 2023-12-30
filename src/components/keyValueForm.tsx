import { useState } from "react"

export type KeyValueParams={
    buttonTitle:string,
    onClick:(key:string,value:string)=>Promise<void>,
}

export function KeyValueForm(params:KeyValueParams){

    const [key,setKey] = useState<string>("");
    const [value,setValue] = useState<string>("");
    const [isBusy,setIsBusy] = useState<boolean>(false);

    function onClick(){
        setIsBusy(true);
        params.onClick(key,value).then(_=>{
            setIsBusy(false);
        });
    }

    return <tr>
        <td key={0} style={{width:"100px"}}><input style={{width:"100px"}} onChange={e=>setKey(e.target.value)}></input></td>
        <td key={1} style={{width:"100px"}}><input style={{width:"100px"}} onChange={e=>setValue(e.target.value)}></input></td>
        <td key={2}><button disabled={isBusy} style={{width:"100px"}} onClick={onClick}>{params.buttonTitle}</button></td>
    </tr>
}