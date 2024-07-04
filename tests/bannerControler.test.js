import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app'; // suponiendo que app es tu aplicación Express configurada
import Banner from '../models/Banner';

describe('Banner Controller Tests', () => {
  beforeAll(async () => {
    // Conectar a la base de datos antes de las pruebas
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    // Desconectar la base de datos después de las pruebas
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    // Limpiar la colección de Banners antes de cada prueba
    await Banner.deleteMany({});
  });

  it('should register a new banner', async () => {
    const bannerData = {
      title: 'Nuevo Banner',
      image: 'banner1.jpg',
      active: true,
    };

    const res = await request(app)
      .post('/api/banner/register')
      .send(bannerData)
      .set('Accept', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('Success');
    expect(res.body.message).toBe('Banner creado con exito');
    expect(res.body.banner).toHaveProperty('_id');
  });

  it('should update a banner', async () => {
    const banner = new Banner({
      title: 'Banner Existente',
      image: 'banner2.jpg',
      active: true,
    });

    await banner.save();

    const updatedData = {
      title: 'Banner Actualizado',
    };

    const res = await request(app)
      .post(`/api/banner/update/${banner._id}`)
      .send(updatedData)
      .set('Accept', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('Success');
    expect(res.body.message).toBe('Banner actualizado con exito');
    expect(res.body.updatedBanner.title).toBe(updatedData.title);
  });

  // Aquí continuarías con las demás pruebas para las funciones controladoras
});
