const Product = require("../models/Product");

async function generateSKU(name) {
  if (!name || typeof name !== "string") {
    throw new Error("Valid product name is required to generate SKU");
  }

  let isUnique = false;
  let sku;
  let attempts = 0;
  const maxAttempts = 10;

  // Clean the name - remove special characters and spaces
  const cleanName = name.replace(/[^a-zA-Z]/g, "");
  if (cleanName.length === 0) {
    throw new Error("Product name must contain at least one letter");
  }

  while (!isUnique && attempts < maxAttempts) {
    // Get first 3 letters, pad with X if needed
    const namePrefix = cleanName.substring(0, 3).padEnd(3, "X").toUpperCase();
    const number = Math.floor(1000 + Math.random() * 9000);
    sku = `${namePrefix}${number}`;

    console.log(`Attempting SKU generation attempt ${attempts + 1}: ${sku}`);

    try {
      const existingProduct = await Product.findOne({ sku });
      if (!existingProduct) {
        isUnique = true;
        console.log(`Generated unique SKU: ${sku}`);
      } else {
        console.log(`SKU ${sku} already exists, trying again...`);
      }
    } catch (error) {
      console.error("Error checking SKU uniqueness:", error);
      throw new Error("Failed to verify SKU uniqueness: " + error.message);
    }

    attempts++;
  }

  if (!isUnique) {
    throw new Error(
      `Could not generate unique SKU for "${name}" after ${maxAttempts} attempts`
    );
  }

  return sku;
}

module.exports = generateSKU;
