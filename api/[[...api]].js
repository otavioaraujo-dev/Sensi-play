export default async function handler(req, res) {
  try {
    // Extrair path da requisição
    const path = req.url.replace('/api', '');
    const backendUrl = process.env.BACKEND_URL || `http://localhost:8080/api${path}`;
    
    // Copiar headers e método da requisição original
    const fetchOptions = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        ...req.headers,
      },
    };

    // Adicionar body se existir
    if (req.body) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    const response = await fetch(backendUrl, fetchOptions);

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Backend error' });
    }

    const data = await response.json();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(data);
  } catch (error) {
    console.error('Erro ao fazer proxy para backend:', error);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(503).json({ 
      error: 'Backend unavailable', 
      message: error.message,
      hint: 'Configure a variável de ambiente BACKEND_URL com a URL do seu backend'
    });
  }
}
