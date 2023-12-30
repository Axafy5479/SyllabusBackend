import { useState } from "react";
import { ErrorInfo, IsError } from "./error";

export type DeleteParams = {
    deleteItem:(key:string)=>Promise<boolean|ErrorInfo>
}

export function DeleteButton(params:DeleteParams){
    const [key,setKey] = useState<string>("");
    const [value,setValue] = useState<string|null>("");
    const [isBusy,setIsBusy] = useState<boolean>(false);

    async function onClick(){
        setIsBusy(true);
        const value = await params.deleteItem(key);
        if(IsError(value))setValue(value.message);
        else setValue(value.toString());
    }

    return (
        <tr>
        <td key={0} style={{width:"100px"}}><input style={{width:"100px"}} onChange={e=>setKey(e.target.value)}></input></td>
        <td key={1} style={{width:"100px"}}><a style={{width:"100px"}}>{value}</a></td>
                <td key={2}> <button onClick={()=>onClick()} disabled={isBusy}>removeItem</button></td>
            </tr>
    )
}