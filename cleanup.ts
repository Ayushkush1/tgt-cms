import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function clean() {
  const sections = await prisma.section.findMany();
  for (const sec of sections) {
    let modified = false;
    const data = sec.content as Record<string, any>;
    
    // Cleanup HeroSection
    if (sec.type === 'HeroSection') {
      const keys = ['project1Title', 'project2Title', 'project3Title', 'project4Title', 'project5Title', 
                    'project1Category', 'project2Category', 'project3Category', 'project4Category', 'project5Category'];
      for (const k of keys) {
        if (k in data) { delete data[k]; modified = true; }
      }
    }
    
    // Cleanup WhoWeAre
    if (sec.type === 'WhoWeAre') {
      const keys = ['block1Bullet1', 'block1Bullet2', 'block1Bullet3', 'block1Bullet4', 
                    'block2Bullet1', 'block2Bullet2', 'block2Bullet3', 'block2Bullet4'];
      for (const k of keys) {
        if (k in data) { delete data[k]; modified = true; }
      }
    }

    if (modified) {
      await prisma.section.update({
        where: { id: sec.id },
        data: { content: data }
      });
      console.log(`Cleaned up legacy keys in ${sec.type}`);
    }
  }
  await prisma.$disconnect();
}
clean().catch(console.error);
