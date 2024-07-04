
import request from 'supertest';
import express from 'express';
import bannerRouter from '../routes/bannerRouter'; 

describe('Banner Routes and Controllers', () => {
    const app = express();
    app.use(express.json());
    app.use('/banners', bannerRouter);

    // Pruebas para bannerRouter
    describe('bannerRouter', () => {
        it('should register a new banner via API', async () => {
            const res = await request(app)
                .post('/banners/register')
                .set('Authorization', 'Bearer yourAccessTokenHere') // Añadir token de autenticación si es necesario
                .send({ /* datos del banner a registrar */ });

            expect(res.statusCode).toEqual(200); // Ajustar según la respuesta esperada
            // Añadir más aserciones según la respuesta esperada
        });

        it('should update a banner via API', async () => {
            const res = await request(app)
                .patch('/banners/update/testBannerId')
                .set('Authorization', 'Bearer yourAccessTokenHere')
                .send({ /* datos del banner a actualizar */ });

            expect(res.statusCode).toEqual(200); // Ajustar según la respuesta esperada
            // Añadir más aserciones según la respuesta esperada
        });

        it('should update banner image via API', async () => {
            const formData = new FormData();
            formData.append('image', fs.createReadStream('test-image.jpg'));

            const res = await request(app)
                .patch('/banners/updateimage')
                .set('Authorization', 'Bearer yourAccessTokenHere')
                .attach('image', 'test-image.jpg');

            expect(res.statusCode).toEqual(200); // Ajustar según la respuesta esperada
            // Añadir más aserciones según la respuesta esperada
        });

        it('should list banners via API', async () => {
            const res = await request(app)
                .get('/banners/list/1') // Página 1 de la lista de banners
                .set('Authorization', 'Bearer yourAccessTokenHere');

            expect(res.statusCode).toEqual(200); // Ajustar según la respuesta esperada
            // Añadir más aserciones según la respuesta esperada
        });
    });
});



