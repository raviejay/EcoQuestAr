export default async function handler(req, res) {
  const WORKSPACE = process.env.WORKSPACE;
  const WORKFLOW_ID = process.env.WORKFLOW_ID;
  const API_KEY = process.env.ROBOFLOW_API_KEY;

  const url = `https://serverless.roboflow.com/${WORKSPACE}/workflows/${WORKFLOW_ID}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: API_KEY, 
        inputs: req.body.inputs, 
      }),
    });

    const text = await response.text();

    if (!response.ok) {
      console.log("Roboflow error:", text);
      return res.status(response.status).send(text);
    }

    res.status(200).send(text);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
