const prisma = require('../src/db/prisma');

async function main() {
  const user = await prisma.user.upsert({
    where: { id: 1 },
    update: { name: 'Demo author' },
    create: { id: 1, name: 'Demo author' },
  });

  for (const post of [
    { id: 1, title: 'First post', body: 'The contract survives storage changes.' },
    { id: 2, title: 'Second post', body: 'Migrations record database design.' },
  ]) {
    await prisma.post.upsert({
      where: { id: post.id },
      update: { title: post.title, body: post.body, authorId: user.id },
      create: { ...post, authorId: user.id },
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
