export default async function handler(req, res) {
  try {
    const response = await fetch(
      `https://serverless.roboflow.com/${process.env.WORKSPACE}/workflows/${process.env.WORKFLOW_ID}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      }
    );

    const data = await response.json();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}