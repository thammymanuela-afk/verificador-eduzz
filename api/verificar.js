export default async function handler(req, res) {
  const { email } = req.query;

  try {
    // 1. Obter token via OAuth2 (client_credentials)
    const authRes = await fetch("https://accounts-api.eduzz.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "client_credentials",
        client_id: process.env.EDUZZ_CLIENT_ID,
        client_secret: process.env.EDUZZ_CLIENT_SECRET
      })
    });
    const { access_token } = await authRes.json();
    if (!access_token) return res.status(401).json({ error: "Falha na autenticação" });

    // 2. Executar query de vendas
    const txRes = await fetch(`https://api.eduzz.com/myeduzz/v1/sales?buyerEmail=${email}`, {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    const txData = await txRes.json();

    // 3. Verificar se há venda com o produto desejado
    const comprou = txData.items?.some(
      item => item.product.id === "2750607" && item.status === "paid"
    );

    res.status(200).json({
      email,
      comprou,
      produto: comprou ? "Agente Ermes Converta+ Premium" : null,
      plano: comprou ? "premium" : "nenhum"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno ao verificar compra" });
  }
}
