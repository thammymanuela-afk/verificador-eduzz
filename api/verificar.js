export default async function handler(req, res) {
  const { email } = req.query;

  try {
    // 1. Solicita o access_token usando Client ID e Secret
    const authResponse = await fetch("https://api.eduzz.com/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        client_id: process.env.EDUZZ_CLIENT_ID,
        client_secret: process.env.EDUZZ_CLIENT_SECRET
      })
    });

    const authData = await authResponse.json();

    if (!authData?.access_token) {
      return res.status(401).json({ error: "Erro ao autenticar na API da Eduzz" });
    }

    const token = authData.access_token;

    // 2. Usa o token para consultar as transações do e-mail
    const transactionsResponse = await fetch(`https://api.eduzz.com/sale/transaction/list?customer_email=${email}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    const transactionsData = await transactionsResponse.json();

    const comprou = transactionsData?.data?.some(item =>
      item.product.id === 2750607 && item.status === 3
    );

    res.status(200).json({
      email,
      comprou,
      produto: comprou ? "Agente Ermes Converta+ Premium" : null,
      plano: comprou ? "premium" : "nenhum"
    });

  } catch (err) {
    console.error("Erro na verificação:", err);
    res.status(500).json({ error: "Erro interno ao verificar compra" });
  }
}

