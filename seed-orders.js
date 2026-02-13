db = db.getSiblingDB('salescout');
const storeId = ObjectId('698f51b2a8095c8c0c709f91');

const products = [
  { id: 'DEMO-001', name: 'Samsung Galaxy S24 Ultra 256GB', code: 'SGS24U', price: 549990 },
  { id: 'DEMO-002', name: 'Apple iPhone 15 Pro Max 256GB', code: 'AIP15PM', price: 699990 },
  { id: 'DEMO-003', name: 'Xiaomi 14 Ultra 512GB', code: 'X14U', price: 399990 },
  { id: 'DEMO-004', name: 'Sony WH-1000XM5', code: 'SWHXM5', price: 149990 },
  { id: 'DEMO-005', name: 'MacBook Air M3', code: 'MBA3', price: 599990 },
  { id: 'DEMO-006', name: 'Samsung Galaxy Watch 6', code: 'SGW6', price: 179990 },
  { id: 'DEMO-007', name: 'iPad Air M2', code: 'IPA2', price: 349990 },
];

const cities = ['Алматы', 'Астана', 'Караганда', 'Шымкент', 'Актобе'];
const states = ['COMPLETED', 'DELIVERY', 'PICKUP', 'COMPLETED', 'COMPLETED'];
const fnames = ['Арман', 'Айгерим', 'Нурсултан', 'Данияр', 'Камила', 'Бекзат', 'Алия', 'Тимур'];
const lnames = ['Ахметов', 'Сулейменова', 'Касымов', 'Нурланова', 'Серикбаев'];

const orders = [];
const now = new Date();

for (let day = 30; day >= 0; day--) {
  const count = Math.floor(Math.random() * 8) + 2;
  for (let j = 0; j < count; j++) {
    const d = new Date(now);
    d.setDate(d.getDate() - day);
    d.setHours(Math.floor(Math.random() * 14) + 8, Math.floor(Math.random() * 60), 0, 0);
    
    const prod = products[Math.floor(Math.random() * products.length)];
    const qty = Math.floor(Math.random() * 3) + 1;
    const num = 100000 + orders.length;
    const city = cities[Math.floor(Math.random() * cities.length)];

    orders.push({
      storeId: storeId,
      orderId: String(num),
      totalPrice: prod.price * qty,
      customerFirstName: fnames[Math.floor(Math.random() * fnames.length)],
      customerLastName: lnames[Math.floor(Math.random() * lnames.length)],
      customerPhone: '+7707' + String(Math.floor(Math.random() * 9000000) + 1000000),
      deliveryAddress: city,
      deliveryCost: 0,
      deliveryMode: 'DELIVERY_LOCAL',
      town: city,
      orderCode: 'ORD-' + num,
      productId: prod.id,
      productName: prod.name,
      productCode: prod.code,
      products: [{ name: prod.name, quantity: qty, totalPrice: prod.price * qty }],
      quantity: qty,
      state: states[Math.floor(Math.random() * states.length)],
      status: 'APPROVED',
      creationDate: d,
      completedDate: day > 1 ? new Date(d.getTime() + 86400000) : null,
      url: 'https://kaspi.kz/merchant/orders/' + num,
      category: null,
      addressDisplayName: '',
      comment: '',
      reviewsSent: false,
      orderInfoSent: false,
      taplinkSent: false,
      fromSSTap: false,
      createdAt: d,
      updatedAt: d,
    });
  }
}

const result = db.Order.insertMany(orders);
print('Inserted ' + orders.length + ' demo orders');

let totalRevenue = 0;
for (const o of orders) totalRevenue += o.totalPrice;
print('Total revenue: ' + totalRevenue);
