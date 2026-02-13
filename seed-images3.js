db = db.getSiblingDB('salescout');
const storeId = ObjectId('698f51b2a8095c8c0c709f91');

const imageMap = {
  'Samsung Galaxy S24 Ultra 256GB': 'https://picsum.photos/seed/galaxys24/200/200',
  'Apple iPhone 15 Pro Max 256GB': 'https://picsum.photos/seed/iphone15pro/200/200',
  'Xiaomi 14 Ultra 512GB': 'https://picsum.photos/seed/xiaomi14/200/200',
  'Sony WH-1000XM5 Наушники': 'https://picsum.photos/seed/sonywh1000/200/200',
  'MacBook Air M3 15 256GB': 'https://picsum.photos/seed/macbookair/200/200',
  'Samsung Galaxy Watch 6 Classic': 'https://picsum.photos/seed/galaxywatch6/200/200',
  'Apple AirPods Pro 2': 'https://picsum.photos/seed/airpodspro/200/200',
  'Dyson V15 Detect': 'https://picsum.photos/seed/dysonv15/200/200',
};

const products = db.Product.find({ storeId: storeId }).toArray();
let updated = 0;

for (const prod of products) {
  const imgUrl = imageMap[prod.name];
  if (imgUrl) {
    db.Product.updateOne({ _id: prod._id }, { $set: { img: imgUrl } });
    updated++;
    print('Updated: ' + prod.name);
  } else {
    print('No image for: ' + prod.name);
  }
}

print('Updated ' + updated + ' products');
