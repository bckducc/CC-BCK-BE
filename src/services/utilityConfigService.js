import pool from '../config/database.js';
import { validatePrice, validateVAT } from '../utils/validators.js';

/**
 * Set or update utility configuration
 * @param {Object} configData - Configuration data containing electric_price, water_price, vat_percent
 * @param {number} landlordUserId - ID of the landlord updating the configuration
 * @returns {Object} The updated configuration record
 * @throws {Error} If validation fails
 */
export const setUtilityConfig = async (configData, landlordUserId) => {
  const { electric_price, water_price, vat_percent } = configData;

  // Validate electric_price >= 0
  validatePrice(electric_price, 'electric_price');

  // Validate water_price >= 0
  validatePrice(water_price, 'water_price');

  // Validate 0 <= vat_percent <= 100
  validateVAT(vat_percent);

  const connection = await pool.getConnection();

  try {
    // Check if configuration already exists
    const [existing] = await connection.query(
      'SELECT id FROM utility_config LIMIT 1'
    );

    if (existing.length > 0) {
      // Update existing configuration
      await connection.query(
        `UPDATE utility_config 
         SET electric_price = ?, water_price = ?, vat_percent = ?, updated_by = ?, updated_at = NOW()
         WHERE id = ?`,
        [electric_price, water_price, vat_percent, landlordUserId, existing[0].id]
      );

      // Retrieve updated configuration
      const [updated] = await connection.query(
        'SELECT * FROM utility_config WHERE id = ?',
        [existing[0].id]
      );

      return updated[0];
    } else {
      // Insert new configuration
      const [result] = await connection.query(
        `INSERT INTO utility_config (electric_price, water_price, vat_percent, updated_by)
         VALUES (?, ?, ?, ?)`,
        [electric_price, water_price, vat_percent, landlordUserId]
      );

      // Retrieve newly created configuration
      const [newConfig] = await connection.query(
        'SELECT * FROM utility_config WHERE id = ?',
        [result.insertId]
      );

      return newConfig[0];
    }
  } finally {
    connection.release();
  }
};

/**
 * Get current utility configuration
 * @param {number} landlordUserId - ID of the landlord (for future multi-tenant support)
 * @returns {Object} Current configuration or default values if none exists
 */
export const getUtilityConfig = async (landlordUserId) => {
  const connection = await pool.getConnection();

  try {
    // Retrieve current configuration
    const [config] = await connection.query(
      'SELECT * FROM utility_config LIMIT 1'
    );

    if (config.length > 0) {
      return config[0];
    } else {
      // Return default values if no configuration exists
      return {
        id: null,
        electric_price: 3500.00,
        water_price: 15000.00,
        vat_percent: 10.00,
        updated_at: null,
        updated_by: null
      };
    }
  } finally {
    connection.release();
  }
};
