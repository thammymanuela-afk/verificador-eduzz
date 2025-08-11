export default async function handler(req, res) {
  const { email } = req.query;

  try {
    // 1. Obter o token OAuth da Eduzz
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

    if (!access_token) {
      return res.status(401).json({ error: "Não foi possível obter token da Eduzz" });
    }

    // 2. Buscar dados do comprador por e-mail
    const cleanEmail = encodeURIComponent(email.trim().toLowerCase());
    const userRes = await fetch(`https://api.eduzz.com/myeduzz/v1/customers/${cleanEmail}`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        Accept: "application/json"
      }
    });

    if (!userRes.ok) {
      const err = await userRes.text();
      return res.status(userRes.status).json({ error: "Erro ao buscar comprador", details: err });
    }

    const userData = await userRes.json();

    res.status(200).json({
      email: userData.email,
      nome: userData.name,
      telefone: userData.phone?.number || null,
      estado: userData.address?.state || null
    });

  } catch (err) {
    console.error("Erro interno:", err);
    res.status(500).json({ error: "Erro interno no servidor", details: err.message });
  }
}
