const request = require('supertest');
const app = require('../src/app');

describe('Admin', () => {
  describe('/admin/best-profession', () => {

    it('should return profession with the highest income within given time range', async () => {
      const { statusCode, body } = await request(app)
        .get('/admin/best-profession')
        .query({ start: '2020-08-10T09:00:00.000Z' })
        .query({ end: '2020-08-16T23:59:59.000Z' });

      expect(statusCode).toEqual(200);
      expect(body).toEqual(
        expect.objectContaining({
          profession: 'Programmer',
          earned: 2683,
        })
      );
    });

    it('should return 404 if there are no jobs within given time range', async () => {
      const { statusCode, body } = await request(app)
        .get('/admin/best-profession')
        .query({ start: '2021-08-10T09:00:00.000Z' })
        .query({ end: '2021-08-16T23:59:59.000Z' });

      expect(statusCode).toEqual(404);
    });
  });

  describe('/admin/best-clients', () => {

    it('should return list of clients who paid most within given time range', async () => {
      const { statusCode, body } = await request(app)
        .get('/admin/best-clients')
        .query({ start: '2020-08-10T09:00:00.000Z' })
        .query({ end: '2020-08-16T23:59:59.000Z' });

      expect(statusCode).toEqual(200);
      expect(body).toContainEqual(
        expect.objectContaining({
          "id": 4,
          "fullName": "Ash Kethcum",
          "paid": 2020
        })
      );
      expect(body).toContainEqual(
        expect.objectContaining({
          "id": 2,
          "fullName": "Mr Robot",
          "paid": 442
        })
      );
    });

    it('should order list by paid money DESC', async () => {
      const { statusCode, body } = await request(app)
        .get('/admin/best-clients')
        .query({ start: '2020-08-10T09:00:00.000Z' })
        .query({ end: '2020-08-16T23:59:59.000Z' });

      expect(statusCode).toEqual(200);
      expect(body[0]).toEqual(
        expect.objectContaining({
          "id": 4,
          "fullName": "Ash Kethcum",
          "paid": 2020
        })
      );
      expect(body[1]).toEqual(
        expect.objectContaining({
          "id": 2,
          "fullName": "Mr Robot",
          "paid": 442
        })
      );
    });

    it('should limit the list by query param', async () => {
      const { statusCode, body } = await request(app)
        .get('/admin/best-clients')
        .query({ start: '2020-08-10T09:00:00.000Z' })
        .query({ end: '2020-08-16T23:59:59.000Z' })
        .query({ limit: 1 });

      expect(statusCode).toEqual(200);
      expect(body).toHaveLength(1)
      expect(body[0]).toEqual(
        expect.objectContaining({
          "id": 4,
          "fullName": "Ash Kethcum",
          "paid": 2020
        })
      );
    });

    it('should return 404 if there are no jobs within given time range', async () => {
      const { statusCode, body } = await request(app)
        .get('/admin/best-clients')
        .query({ start: '2021-08-10T09:00:00.000Z' })
        .query({ end: '2021-08-16T23:59:59.000Z' });

      expect(statusCode).toEqual(404);
    });
  });
});