import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function clean() {
  const sections = await prisma.section.findMany({
    where: { type: 'Integrations' }
  });
  
  for (const sec of sections) {
    let modified = false;
    const data = sec.content;
    
    if (data.headlinePart2 !== undefined) {
      delete data.headlinePart2;
      modified = true;
    }
    
    if (Array.isArray(data.stats)) {
      data.stats = data.stats.map(s => {
        const newS = { ...s };
        if (newS.suffix !== undefined) { delete newS.suffix; modified = true; }
        if (newS.labelLine2 !== undefined) { delete newS.labelLine2; modified = true; }
        return newS;
      });
    }

    if (modified) {
      await prisma.section.update({
        where: { id: sec.id },
        data: { content: data }
      });
      console.log(`Cleaned up legacy keys in Integrations`);
    }
  }
  await prisma.$disconnect();
}
clean().catch(console.error);
