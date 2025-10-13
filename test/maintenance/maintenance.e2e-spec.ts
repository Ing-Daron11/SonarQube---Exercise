import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../../src/app.module';
import * as jwt from 'jsonwebtoken';

describe('Maintenance (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let technicianId: string;
  let equipmentId: string;
  let maintenanceId: string;

  const technicianCredentials = {
    email: 'miguelMar@gmail.com',
    password: 'miguel123',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // LOGIN del técnico
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send(technicianCredentials);

    expect(loginRes.status).toBe(201);
    token = loginRes.body.token;

    // Obtener el technicianId desde el token
    const decoded: any = jwt.decode(token);
    technicianId = decoded.user_id;

    // Obtener ID de equipo (el primero disponible)
    const eqRes = await request(app.getHttpServer())
      .get('/equipment')
      .set('Authorization', `Bearer ${token}`);

    expect(eqRes.status).toBe(200);
    expect(eqRes.body.length).toBeGreaterThan(0);

    equipmentId = eqRes.body[0].id;
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
   * 1. Crear, actualizar y revertir mantenimiento
   *    - Crear un mantenimiento con una descripción inicial
   */

  it('Crear, actualizar y revertir mantenimiento', async () => {
    const descripcionInicial = 'Mantenimiento preventivo básico';
    const descripcionActualizada = 'Revisión interna con limpieza de ventiladores';

    // Crear mantenimiento
    const createRes = await request(app.getHttpServer())
      .post('/maintenance')
      .set('Authorization', `Bearer ${token}`)
      .send({
        technicianId,
        equipmentId,
        description: descripcionInicial,
      });

    console.log('🛠️ Crear response:', createRes.body);
    expect(createRes.status).toBe(201);

    maintenanceId = createRes.body.id;
    expect(maintenanceId).toBeDefined();

    // Actualizar mantenimiento
    const updateRes = await request(app.getHttpServer())
      .patch(`/maintenance/${maintenanceId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        description: descripcionActualizada,
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.description).toBe(descripcionActualizada);

    // Revertir actualización
    const revertRes = await request(app.getHttpServer())
      .patch(`/maintenance/${maintenanceId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        description: descripcionInicial,
      });

    expect(revertRes.status).toBe(200);
    expect(revertRes.body.description).toBe(descripcionInicial);
  });

  /**
   * 2. Listar mantenimientos y obtener uno por ID
   *   - Listar todos los mantenimientos
   */
  it('Listar mantenimientos y obtener uno por ID', async () => {
      // Obtener todos los mantenimientos
      const listRes = await request(app.getHttpServer())
        .get('/maintenance')
        .set('Authorization', `Bearer ${token}`);

      expect(listRes.status).toBe(200);
      expect(Array.isArray(listRes.body)).toBe(true);
      expect(listRes.body.length).toBeGreaterThan(0);

      const oneId = listRes.body[0].id;

      // Obtener un mantenimiento específico por ID
      const oneRes = await request(app.getHttpServer())
        .get(`/maintenance/${oneId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(oneRes.status).toBe(200);
      expect(oneRes.body.id).toBe(oneId);
    });


//                 _               _   _     
//   ___  __ _  __| |  _ __   __ _| |_| |__  
//  / __|/ _` |/ _` | | '_ \ / _` | __| '_ \ 
//  \__ \ (_| | (_| | | |_) | (_| | |_| | | |
//  |___/\__,_|\__,_| | .__/ \__,_|\__|_| |_|
//                    |_|                    
    
    /**
     * 3. Intentar crear un mantenimiento sin descripción
     * 
     */
    it(' No debe crear mantenimiento sin descripción', async () => {
      const res = await request(app.getHttpServer())
        .post('/maintenance')
        .set('Authorization', `Bearer ${token}`)
        .send({
          equipmentId,
          technicianId,
        });

      expect(res.status).toBe(500);
      expect(res.body.message).toContain('Error creating maintenance: null value in column \"description\" of relation \"maintenance\" violates not-null constraint');
    });


    /**
     * 4. Mantener el UUID inválido
     */
    it('No debe crear mantenimiento con UUID inválido', async () => {
      const res = await request(app.getHttpServer())
        .post('/maintenance')
        .set('Authorization', `Bearer ${token}`)
        .send({
          equipmentId: 'id-invalido',
          technicianId: technicianId,
          description: 'Intento fallido de mantenimiento con ID inválido',
        });

      expect(res.status).toBe(500);
    });

    /**
     * 5. No debe permitir crear mantenimiento sin autenticación
     */
    it(' No debe permitir crear mantenimiento sin autenticación', async () => {
      const res = await request(app.getHttpServer())
        .post('/maintenance')
        .send({
          equipmentId,
          technicianId,
          description: 'Mantenimiento no autorizado',
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Unauthorized');
    });


  afterAll(async () => {
    await app.close();
  });
});
