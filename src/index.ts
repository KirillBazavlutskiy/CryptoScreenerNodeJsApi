import express from "express"
import cors from "cors"
import {GetSolidityListHandler} from "./api/GetSolidityList";
import {GetKlinesHandler} from "./api/GetKlines";

const app = express();
const port = 3000;
app.use(cors())

app.get('/', (req, res) => {
    res.send({ message: "Home" });
});

app.use('/api/GetSolidityList', GetSolidityListHandler);
app.use('/api/GetKlines', GetKlinesHandler)

app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
});
