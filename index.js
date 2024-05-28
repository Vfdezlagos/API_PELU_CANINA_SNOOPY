// Importar depencias
import express from "express";
import cors from "cors";
import connection from "./database/connection.js";
import config from "./config.js";
import userRouter from "./routes/userRouter.js";
import dogRouter from "./routes/dogRouter.js";

// crear servidor y asignar puerto
const app = express();
const port = config.PORT;

// aplicar middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));

// Conexión a DB
connection();

// Rutas

app.use('/api/user', userRouter);
app.use('/api/dog', dogRouter);

app.get('/', (req, res) => {
    return res.status(200).send({
        status:'Success',
        message: 'Api Rest Pelu Canina'
    });
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Server running at port ${port}`);
});