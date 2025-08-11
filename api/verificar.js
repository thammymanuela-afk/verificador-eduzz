export default async function handler(req, res) {
  const { email } = req.query;

  const response = await fetch(`https://gateway.apieduzz.com/sellers/transactions?customer_email=${email}`, {
    headers: {
      'Authorization': `Bearer ${process.env.EDUZZ_KEY}`,
      'Content-Type': 'application/json'
    }
  });

  const data = await response.json();

  const comprou = data?.items?.some(item =>
    item.product.id === 2750607 && item.status === 3
  );

  res.status(200).json({
    email,
    comprou,
    produto: comprou ? "Agente Ermes Converta+ Premium" : null,
    plano: comprou ? "premium" : "nenhum"
  });
}
