import { useState } from 'react';

const pages = {
  about: {
    title: 'About Groove',
    body: [
      'Groove is an independent streetwear studio. We design a small line of heavyweight hoodies, tees, and bottoms with a relaxed fit.',
      'Every piece is made for repeat wear: simple colour, honest fabric, and measurements you can check before you order.',
    ],
  },
  shipping: {
    title: 'Shipping',
    body: [
      'Orders are packed within 2 business days. Metro delivery usually takes 3–5 days, and the rest of India 5–8 days.',
      'Shipping is free on orders of ₹1,999 and above. Below that, a flat ₹79 fee is added at checkout.',
    ],
  },
  returns: {
    title: 'Returns',
    body: [
      'Unworn items with tags can be returned within 7 days of delivery. Exchanges are offered when the same size is in stock.',
      'Write to hello@groove.store with your order number to start a return. Refunds for cash-on-delivery orders are sent after the parcel is inspected.',
    ],
  },
  privacy: {
    title: 'Privacy',
    body: [
      'We store your name, email, phone, and delivery address so we can fulfil orders. Passwords are hashed and never shown back to you.',
      'We do not sell customer lists. Session cookies are httpOnly and are used only to keep you signed in.',
    ],
  },
  terms: {
    title: 'Terms',
    body: [
      'Prices are listed in Indian rupees and include applicable taxes unless stated otherwise. Placing an order is an offer to buy, which we accept when the order is confirmed.',
      'We may cancel an order if an item is out of stock or if the delivery address cannot be served.',
    ],
  },
};

const faqs = [
  ['How do I select my size?', 'Use the size chart on the product page. Chest and length are garment measurements in inches, not body measurements.'],
  ['What payment methods are available?', 'Checkout is cash on delivery. You pay when the order arrives.'],
  ['How long does delivery take?', 'Metro cities usually receive parcels in 3–5 days. Other locations take 5–8 days after dispatch.'],
  ['How can I return an item?', 'Email hello@groove.store within 7 days with your order number. Items should be unworn and tagged.'],
  ['How can I exchange an item?', 'Ask for an exchange in the same email. We ship the new size once the original is picked up.'],
  ['Can I cancel my order?', 'Yes, from the order page while the status is Pending or Confirmed.'],
  ['How can I track my order?', 'Open Orders in your account. Status moves from Pending through Shipped to Delivered.'],
  ['What happens if my order arrives damaged?', 'Photograph the parcel and email us within 48 hours. We will replace the piece or refund it.'],
];

export function StaticPage({ name }) {
  const page = pages[name];
  return (
    <article className="page-narrow">
      <h1>{page.title}</h1>
      {page.body.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </article>
  );
}

export function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <div className="page-narrow">
      <h1>FAQ</h1>
      {faqs.map(([question, answer], index) => (
        <button key={question} type="button" className={`faq ${open === index ? 'open' : ''}`} onClick={() => setOpen(index)}>
          <strong>{question}</strong>
          {open === index && <span>{answer}</span>}
        </button>
      ))}
    </div>
  );
}

export function Contact() {
  const [sent, setSent] = useState(false);

  function submit(event) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <div className="page-narrow">
      <h1>Contact</h1>
      <p>Email hello@groove.store · Phone +91 80 4000 2210 · Studio 14, Lane 3, Indiranagar, Bengaluru</p>
      {sent ? (
        <p className="form-ok">Message noted. We will reply by email.</p>
      ) : (
        <form className="stack-form" onSubmit={submit}>
          <label>Name<input required name="name" /></label>
          <label>Email<input required type="email" name="email" /></label>
          <label>Message<textarea required name="message" rows="5" /></label>
          <button className="btn" type="submit">Submit</button>
        </form>
      )}
    </div>
  );
}
