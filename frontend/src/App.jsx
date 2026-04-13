import { useEffect, useState } from "react";

function App() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/products")
      .then(res => res.json())
      .then(data => setProducts(data));
  }, []);

  return (
    <div>
      <h1>Danh sách sản phẩm</h1>

      {products.map(p => (
        <div key={p.id}>
          <h3>{p.name}</h3>
          <p>{p.price} VND</p>
        </div>
      ))}
    </div>
  );
}

export default App;