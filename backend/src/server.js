import { server } from "./app.js";
import connectDB from "./config/database.js";

const PORT = process.env.PORT || 5000;

connectDB();

// ✅ IMPORTANT: use server.listen
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 