import app from "./app.js";

import connectDB from "./config/database.js";

const PORT = process.env.PORT || 5000;
connectDB();

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
