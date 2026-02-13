db = db.getSiblingDB('salescout');
const storeId = ObjectId('698f51b2a8095c8c0c709f91');

const imageMap = {
  'Samsung Galaxy S24 Ultra 256GB': 'https://img.freepik.com/free-photo/smartphone-balancing-with-pink-background_23-2150271746.jpg?semt=ais_hybrid&w=200',
  'Apple iPhone 15 Pro Max 256GB': 'https://img.freepik.com/free-photo/modern-smartphone-balancing-with-dark-background_23-2150296466.jpg?semt=ais_hybrid&w=200',
  'Xiaomi 14 Ultra 512GB': 'https://img.freepik.com/free-photo/view-smartphone-device-with-screen_23-2150757065.jpg?semt=ais_hybrid&w=200',
  'Sony WH-1000XM5 Наушники': 'https://img.freepik.com/free-photo/wireless-headphones-balancing-with-pink-background_23-2150271763.jpg?semt=ais_hybrid&w=200',
  'MacBook Air M3 15 256GB': 'https://img.freepik.com/free-photo/laptop-balancing-with-dark-background_23-2150296471.jpg?semt=ais_hybrid&w=200',
  'Samsung Galaxy Watch 6 Classic': 'https://img.freepik.com/free-photo/smartwatch-screen-digital-device_53876-97361.jpg?semt=ais_hybrid&w=200',
  'Apple AirPods Pro 2': 'https://img.freepik.com/free-photo/white-earbuds-digital-device_53876-96853.jpg?semt=ais_hybrid&w=200',
  'Dyson V15 Detect': 'https://img.freepik.com/free-photo/vaccum-cleaner-isolated-transparent-background_191095-10919.jpg?semt=ais_hybrid&w=200',
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
