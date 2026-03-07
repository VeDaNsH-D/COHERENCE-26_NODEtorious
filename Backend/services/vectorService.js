const VectorDoc = require("../models/vectorDoc");
const { createEmbedding } = require("./embeddingService");

async function addDocument(text) {

    const embedding = await createEmbedding(text);

    const doc = new VectorDoc({
        text,
        embedding
    });

    await doc.save();

}

async function searchSimilar(query) {

    const embedding = await createEmbedding(query);

    const results = await VectorDoc.aggregate([
        {
            $vectorSearch: {
                index: "vector_index",
                path: "embedding",
                queryVector: embedding,
                numCandidates: 50,
                limit: 3
            }
        }
    ]);

    return results.map(r => r.text);
}

async function indexLead(lead) {
    const parts = [`Lead: ${lead.name || "Unknown"}`];
    if (lead.email) parts.push(`Email: ${lead.email}`);
    if (lead.company) parts.push(`Company: ${lead.company}`);
    if (lead.role) parts.push(`Role: ${lead.role}`);
    if (lead.industry) parts.push(`Industry: ${lead.industry}`);
    if (lead.seniority) parts.push(`Seniority: ${lead.seniority}`);
    if (lead.company_size) parts.push(`Company Size: ${lead.company_size}`);
    if (lead.lead_source) parts.push(`Source: ${lead.lead_source}`);
    if (lead.lead_score != null) parts.push(`Lead Score: ${(lead.lead_score * 100).toFixed(1)}%`);
    if (lead.best_send_day) parts.push(`Best Send Day: ${lead.best_send_day}`);
    if (lead.best_send_hour != null) parts.push(`Best Send Hour: ${lead.best_send_hour}:00`);
    if (lead.status) parts.push(`Status: ${lead.status}`);
    if (Array.isArray(lead.insights) && lead.insights.length > 0) {
        parts.push(`Insights: ${lead.insights.join("; ")}`);
    }
    await addDocument(parts.join(". "));
}

async function indexLeadsBatch(leads) {
    for (const lead of leads) {
        try { await indexLead(lead); } catch (err) {
            console.error(`RAG index failed for lead ${lead.email}:`, err.message);
        }
    }
}

async function indexWorkflow(workflow) {
    const parts = [`Workflow: ${workflow.name}`];
    if (workflow.description) parts.push(`Description: ${workflow.description}`);
    const nodeCount = Array.isArray(workflow.nodes) ? workflow.nodes.length : 0;
    parts.push(`Steps: ${nodeCount}`);
    if (Array.isArray(workflow.nodes)) {
        const labels = workflow.nodes
            .map(n => n.data?.label)
            .filter(Boolean);
        if (labels.length > 0) parts.push(`Actions: ${labels.join(" → ")}`);
    }
    await addDocument(parts.join(". "));
}

async function indexAnalytics(stats) {
    const ts = new Date().toISOString().split("T")[0];
    const text = `Campaign Analytics as of ${ts}: ` +
        `Total Leads: ${stats.totalLeads}, ` +
        `Emails Sent: ${stats.emailsSent}, ` +
        `Replies: ${stats.replies}, ` +
        `Conversions: ${stats.conversions}, ` +
        `Response Rate: ${stats.responseRate}%, ` +
        `Average Lead Score: ${stats.averageLeadScorePct}%, ` +
        `Workflow Runs - Running: ${stats.workflowRuns.running}, ` +
        `Completed: ${stats.workflowRuns.completed}, ` +
        `Failed: ${stats.workflowRuns.failed}.`;
    await addDocument(text);
}

module.exports = {
    addDocument,
    searchSimilar,
    indexLead,
    indexLeadsBatch,
    indexWorkflow,
    indexAnalytics
};