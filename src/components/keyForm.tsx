import { useState } from "react"
import { ErrorInfo, IsError } from "./error";

export type KeyParams={
    buttonTitle:string,
    onClick:(key:string)=>Promise<string | undefined | ErrorInfo>,
}

export function KeyForm(params:KeyParams){

    const [key,setKey] = useState<string>("");
    const [value,setValue] = useState<string|null>("");
    const [isBusy,setIsBusy] = useState<boolean>(false);

    async function onClick(){
        setIsBusy(true);
        const value = await params.onClick(key);
        if(IsError(value))setValue(value.message);
        else if(value == undefined)setValue("undefined");
        else setValue(value);
        setIsBusy(false);
    }

    return <tr>
        <td key={0} style={{width:"100px"}}><input style={{width:"100px"}} onChange={e=>setKey(e.target.value)}></input></td>
        <td key={1} style={{width:"100px"}}><a style={{width:"100px"}}>{value}</a></td>
        <td key={2}><button disabled={isBusy} style={{width:"100px"}} onClick={onClick}>{params.buttonTitle}</button></td>
    </tr>
}