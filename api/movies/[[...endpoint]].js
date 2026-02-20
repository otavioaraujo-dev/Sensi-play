export default async function handler(req, res) {
  try {
    // Extrair parâmetros da query
    const { endpoint = 'popular' } = req.query;
    const backendUrl = process.env.BACKEND_URL || `http://localhost:8080/api/movies/${endpoint}`;
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Backend temporarily unavailable' });
    }

    const data = await response.json();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(data);
  } catch (error) {
    console.error('Erro ao conectar ao backend:', error);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(503).json({ error: 'Backend unavailable', message: error.message });
  }
}
