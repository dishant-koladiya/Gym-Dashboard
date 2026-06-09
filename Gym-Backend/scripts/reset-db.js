const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  // Delete in order of dependency to avoid FK issues
  try { const r = await p.payment.deleteMany(); console.log('Deleted ' + r.count + ' payments'); } catch (e) { console.log('Skipping payments: ' + e.message); }
  try { const r = await p.memberSubscription.deleteMany(); console.log('Deleted ' + r.count + ' subscriptions'); } catch (e) { console.log('Skipping subscriptions: ' + e.message); }
  try { const r = await p.attendance.deleteMany(); console.log('Deleted ' + r.count + ' attendance records'); } catch (e) { console.log('Skipping attendance: ' + e.message); }
  try { const r = await p.member.deleteMany(); console.log('Deleted ' + r.count + ' members'); } catch (e) { console.log('Skipping members: ' + e.message); }

  await p.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
