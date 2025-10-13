import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import * as jwt from 'jsonwebtoken';

describe('Users (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let user_id: string;

  const loginCredentials = {
    email: 'daron@gmail.com',
    password: 'daron123',
  };

  const originalName = 'daron';
  const updatedName = 'NuevoNombre';

  // ========== LOGIN ==========
    /**
     * 0. Esto es un setup para iniciar sesión
     * y obtener el token JWT para las pruebas
     */
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send(loginCredentials);

    expect(res.status).toBe(201);
    token = res.body.token;

    const decoded: any = jwt.decode(token);
    user_id = decoded.user_id;
  });
//      |===============================|
//      | _____ _____ ____ _____ ____   |
//      | |_   _| ____/ ___|_   _/ ___| |
//      |   | | |  _| \___ \ | | \___ \ |
//      |   | | | |___ ___) || |  ___) ||
//      |   |_| |_____|____/ |_| |____/ |
//      |===============================|
                          

//   _   _                                       _   _     
//  | | | | __ _ _ __  _ __  _   _   _ __   __ _| |_| |__  
//  | |_| |/ _` | '_ \| '_ \| | | | | '_ \ / _` | __| '_ \ 
//  |  _  | (_| | |_) | |_) | |_| | | |_) | (_| | |_| | | |
//  |_| |_|\__,_| .__/| .__/ \__, | | .__/ \__,_|\__|_| |_|
//              |_|   |_|    |___/  |_|      


  /**
   * 1. Este test verifica que el token JWT 
   * se genere correctamente y contenga el ID de usuario
  */
  it('/users/me (GET) – debe retornar el perfil', async () => {
    const res = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(user_id);
    expect(res.body.email).toBe(loginCredentials.email);
  });

  /**
   * 2. Este test verifica que el endpoint
   * /users/:id retorne el usuario por ID y sus credenciales
   * (email y nombre)
   */
  it('/users/:id (GET) – debe retornar el usuario por ID', async () => {
    const res = await request(app.getHttpServer())
      .get(`/users/${user_id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(user_id);
    expect(res.body.email).toBe(loginCredentials.email);
  });

  /**
   * 3. Este test verifica que el endpoint
   * /users/:id aactualice el nombre del usuario
   * y retorne el usuario actualizado
   */
  it('/users/:id (PATCH) – actualizar nombre', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/users/${user_id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: updatedName,
      });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe(updatedName);
  });

  /**
   * 4. Este test verifica que el endpoint
   * /users/:id actualice el nombre del usuario al original
   * y retorne el usuario actualizado dejándolo como antes
   * (daron)
   */
  it('/users/:id (PATCH) – revertir nombre original', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/users/${user_id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: originalName,
      });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe(originalName);
  });


//                 _               _   _     
//   ___  __ _  __| |  _ __   __ _| |_| |__  
//  / __|/ _` |/ _` | | '_ \ / _` | __| '_ \ 
//  \__ \ (_| | (_| | | |_) | (_| | |_| | | |
//  |___/\__,_|\__,_| | .__/ \__,_|\__|_| |_|
//                    |_|   

/**
 * 5. Obtener perfil sin autenticación
 */
  it(' No debe permitir obtener perfil sin token', async () => {
    const res = await request(app.getHttpServer())
      .get('/users/me'); // sin token

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Unauthorized');
  });

  /**
   * 6. Buscar usuario con UUID inválido
   */
  it(' No debe permitir buscar usuario con ID inválido', async () => {
    const res = await request(app.getHttpServer())
      .get('/users/1234') // ID no es UUID
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(500);
  });

  /**
   * 7. Actualizar usuario con token inválido
   */
  it('No debe permitir actualizar usuario sin un token válido', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/users/${user_id}`)
      .set('Authorization', `Bearer invalid-token`) ///////////////////////
      .send({ name: 'daron' }); // inválido por estar vacío

    expect(res.status).toBe(401);
  });

  /**
   * 8. Prueba compuesta: múltiples errores en cascada
   */
  it(' Operaciones fallidas encadenadas: perfil sin token, actualización inválida y acceso con usuario no existente', async () => {
    // 1. Acceso a perfil sin token
    const res1 = await request(app.getHttpServer())
      .get('/users/me'); // sin Authorization

    expect(res1.status).toBe(401);
    expect(res1.body.message).toBe('Unauthorized');

    // 2. Intento de actualizar usuario con campos vacíos
    const res2 = await request(app.getHttpServer())
      .patch(`/users/${user_id}`)
      .set('Authorization', `Bearer invalid-token`)
      .send({ name: '' }); // name vacío = inválido

    expect(res2.status).toBe(401);

    // 3. Intentar acceder a un usuario que no existe
    const fakeUserId = '11111111-1111-1111-1111-111111111111'; // UUID válido pero no existe

    const res3 = await request(app.getHttpServer())
      .get(`/users/${fakeUserId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res3.status).toBe(404);
    expect(res3.body.message).toContain('not found');
  });

  /**
   * Y ya esta vuelta es para cerrar la sesión
   * y eliminar el token de la memoria
   */
  afterAll(async () => {
    await app.close();
  });
});
