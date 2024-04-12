import express from "express"
import {GetSolidityListHandler} from "./api/GetSolidityList";

const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.send({ message: "Home" });
});

app.use('/api/GetSolidityList', GetSolidityListHandler);

app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
});
