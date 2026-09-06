import { syncAllProjectPredictions } from "../src/lib/ml/random-forest";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("⚡ Running Random Forest delay predictions for all projects...");
  const result = await syncAllProjectPredictions();
  console.log(`✅ Completed predictions for ${result.count} projects!`);

  const predictions = await prisma.riskPrediction.findMany({
    include: { project: { select: { projectName: true, projectId: true } } },
    orderBy: { delayProbability: "desc" },
  });

  console.log("\n📊 Random Forest Predictions Summary:");
  predictions.forEach((p) => {
    const prob = p.delayProbability !== null ? `${(p.delayProbability * 100).toFixed(1)}%` : "N/A";
    console.log(`  • [${p.riskLevel || "N/A"}] ${prob} - ${p.project.projectName} (${p.project.projectId})`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
