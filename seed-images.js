db = db.getSiblingDB('salescout');
const storeId = ObjectId('698f51b2a8095c8c0c709f91');

const imageMap = {
  'Samsung Galaxy S24 Ultra 256GB': 'https://resources.cdn-kaspi.kz/img/m/p/h98/h98/84378448601118.png?format=gallery',
  'Apple iPhone 15 Pro Max 256GB': 'https://resources.cdn-kaspi.kz/img/m/p/hf0/h45/64420981440542.jpg?format=gallery',
  'Xiaomi 14 Ultra 512GB': 'https://resources.cdn-kaspi.kz/img/m/p/hce/h30/84898006155294.jpg?format=gallery',
  'Sony WH-1000XM5 Наушники': 'https://resources.cdn-kaspi.kz/img/m/p/h70/hf0/63890855682078.jpg?format=gallery',
  'MacBook Air M3': 'https://resources.cdn-kaspi.kz/img/m/p/h2f/h0d/84378279583774.jpg?format=gallery',
  'Samsung Galaxy Watch 6 Classic': 'https://resources.cdn-kaspi.kz/img/m/p/hba/h68/69271825956894.jpg?format=gallery',
  'Apple AirPods Pro 2': 'https://resources.cdn-kaspi.kz/img/m/p/h25/hd7/64206553366558.jpg?format=gallery',
  'Dyson V15 Detect': 'https://resources.cdn-kaspi.kz/img/m/p/h46/h8c/64541068173342.jpg?format=gallery',
  'iPad Air M2': 'https://resources.cdn-kaspi.kz/img/m/p/hc9/h0d/84897972994078.jpg?format=gallery',
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

print('Updated ' + updated + ' products with images');
