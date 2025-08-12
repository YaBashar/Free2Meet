import { Store } from "./interfaces"
import fs from "fs"


let data: Store = {
    events: []
}

function setData(newData: Store)  {
const dataString = JSON.stringify(data, null, 2);
  fs.writeFileSync('data.json', dataString);
  data = newData;
}

function getData() : Store {
    return data;
}

export { setData, getData }