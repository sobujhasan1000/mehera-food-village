import axios from "axios";
import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useUser } from "../../Context/useUser";

const apiUrl = import.meta.env.VITE_API_URL;

const OurProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const { user } = useUser();

  useEffect(() => {
    if (!apiUrl) {
      setError("API URL is not defined.");
      setLoading(false);
      return;
    }

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(""); // Reset error before retrying
        const response = await axios.get(`${apiUrl}api/products`);
        setProducts(response.data);
        setLoading(false);
      } catch (error) {
        if (retryCount < 3) {
          setTimeout(() => {
            setRetryCount((prev) => prev + 1);
          }, 2000); // Retry after 2 seconds
        } else {
          setError(`Failed to load products: ${error.message}`);
          setLoading(false);
        }
      }
    };

    fetchProducts();
  }, [retryCount]); // Retry on failure

  const handleDelete = async (productId) => {
    try {
      await axios.delete(`${apiUrl}api/products/${productId}`);
      setProducts((prevProducts) =>
        prevProducts.filter((product) => product._id !== productId)
      );
    } catch (error) {
      console.error("Failed to delete product:", error);
      alert("Failed to delete product. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="text-center text-lg font-semibold">
        Loading products...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        {error} <br />
        {retryCount >= 3 && (
          <button
            onClick={() => setRetryCount(0)}
            className="bg-blue-500 text-white px-4 py-2 mt-4 rounded-md"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-center mb-4">Our Products</h1>
      <div className="grid grid-cols-2 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {products.map((product) => (
          <div
            key={product._id}
            className="bg-white shadow-lg rounded-lg overflow-hidden border-2"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-fit object-cover"
            />
            <div className="flex justify-between bg-slate-100">
              <p className="text-sm font-semibold p-2">{product.name}</p>
              <p className="text-sm font-bold p-2">${product.price}</p>
            </div>
            <div className="p-2 flex justify-center bg-slate-100">
              {user?.role === "meheraadmin" ? (
                <button
                  onClick={() => handleDelete(product._id)}
                  className="bg-red-500 text-white p-1 rounded-md"
                >
                  Delete
                </button>
              ) : (
                <Link to="/checkOutPage" state={{ product }}>
                  <button className="bg-[#30d490] p-2 rounded-md text-white">
                    Order Now
                  </button>
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OurProducts;
