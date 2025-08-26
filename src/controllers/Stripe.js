const Stripe = require('stripe');
const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_API_SECRET_KEY);

module.exports = {
  poststripe: async (req, res) => {
    try {
      const { cartItems, currency } = req.body;
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: cartItems.map((item) => ({
          price_data: {
            currency: currency || 'usd',
            product_data: {
              name: item.name,
              images: [item.image]
            },
            unit_amount: Math.round(item.price * 100)
          },
          quantity: item.quantity
        })),
        billing_address_collection: 'required',
        shipping_address_collection: {
          allowed_countries: ['IN', 'US', 'CA']
        },
        success_url: `${req.headers.origin}/cart?paymentSuccess=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/cart?paymentCancelled=true`
      });
      res.status(200).json({
        id: session.id,
        url: session.url
      });
    } catch (err) {
      console.error('Stripe Checkout Error:', err);
      res.status(500).json({ error: err.message });
    }
  }
};
