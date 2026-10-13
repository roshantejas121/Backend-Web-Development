const prisma = require('../db/prisma');

function databaseError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function mapDatabaseError(error) {
  if (error && error.code === 'P2002') {
    return databaseError('The requested relationship already exists', 409);
  }
  if (error && error.code === 'P2003') {
    return databaseError('The related resource does not exist', 422);
  }
  return error;
}

async function findAll() {
  return prisma.post.findMany({ orderBy: { id: 'asc' } });
}

async function findById(id) {
  return prisma.post.findUnique({ where: { id: Number(id) } });
}

async function create(fields) {
  try {
    return await prisma.post.create({
      data: { title: fields.title, body: fields.body || '', authorId: fields.authorId },
    });
  } catch (error) {
    throw mapDatabaseError(error);
  }
}

async function update(id, patch) {
  const existing = await findById(id);
  if (!existing) return null;

  const data = {};
  if (patch.title !== undefined) data.title = patch.title;
  if (patch.body !== undefined) data.body = patch.body;

  try {
    return await prisma.post.update({ where: { id: Number(id) }, data });
  } catch (error) {
    throw mapDatabaseError(error);
  }
}

async function remove(id) {
  const existing = await findById(id);
  if (!existing) return false;

  try {
    await prisma.post.delete({ where: { id: Number(id) } });
    return true;
  } catch (error) {
    throw mapDatabaseError(error);
  }
}

module.exports = { findAll, findById, create, update, remove };
