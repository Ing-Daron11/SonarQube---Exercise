import * as request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { DataSource } from 'typeorm';
import { EquipmentCategory } from 'src/equipment/enums/equipment.enum';

describe('Equipment E2E', () => {
    let app: INestApplication;
    let httpServer: any;
    let token: string;
    let equipmentId: string;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
        await app.init();
        httpServer = app.getHttpServer();

        // Login to get token
        const loginRes = await request(httpServer)
            .post('/auth/login')
            .send({ email: 'daron@gmail.com', password: 'daron123' });

        token = loginRes.body.token;
    });

    afterAll(async () => {
        await app.close();
    });

    it('should create a new equipment', async () => {
        const res = await request(httpServer)
            .post('/equipment')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Canon Camera X2',
                model: 'EOS 90D',
                description: 'Professional DSLR',
                category: EquipmentCategory.CAMERA,
            })
            .expect(201);

        expect(res.body.name).toBe('Canon Camera X2');
        equipmentId = res.body.id;
    });

    it('should not allow duplicate equipment creation', async () => {
        await request(httpServer)
            .post('/equipment')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Canon Camera X2',
                model: 'EOS 90D',
                description: 'Duplicate test',
                category: EquipmentCategory.CAMERA,
            })
            .expect(409); // Conflict
    });

    it('should retrieve the created equipment', async () => {
        const res = await request(httpServer)
            .get(`/equipment/${equipmentId}`)
            .expect(200);

        expect(res.body.id).toBe(equipmentId);
        expect(res.body.name).toBe('Canon Camera X2');
    });

    it('should update the equipment', async () => {
        const res = await request(httpServer)
            .patch(`/equipment/${equipmentId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ description: 'Updated description' })
            .expect(200);

        expect(res.body.description).toBe('Updated description');
    });

    it('should change status to RENTED', async () => {
        const res = await request(httpServer)
            .patch(`/equipment/status/${equipmentId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ status: 'rented' })
            .expect(200);

        expect(res.body.status).toBe('rented');
    });

    it('should fail to change status to MAINTENANCE', async () => {
        const res = await request(httpServer)
            .patch(`/equipment/status/${equipmentId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ status: 'maintenance' })
            .expect(200);
        expect(res.body.status).toBe('maintenance');
    });

    it('should change status to AVAILABLE', async () => {
        const res = await request(httpServer)
            .patch(`/equipment/status/${equipmentId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ status: 'available' })
            .expect(200);

        expect(res.body.status).toBe('available');
    });
    
    it('should fail to change to invalid status', async () => {
        await request(httpServer)
            .patch(`/equipment/status/${equipmentId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ status: 'INVALID_STATUS' })
            .expect(400);
    });

    it('should delete the equipment', async () => {
        const res = await request(httpServer)
            .delete(`/equipment/${equipmentId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(res.body.message).toContain('deleted successfully');
    });

    it('should fail to retrieve deleted equipment', async () => {
        await request(httpServer)
            .get(`/equipment/${equipmentId}`)
            .expect(404);
    });
});
