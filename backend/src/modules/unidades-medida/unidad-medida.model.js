const db = require('../../core/config/database');

class UnidadMedidaModel {
    /**
     * Crea una nueva unidad de medida en la base de datos
     * @param {Object} unidadData - Datos de la unidad de medida
     * @returns {Promise<number>} - ID de la unidad de medida creada
     */
    static async create(unidadData) {
        const { UnidadMedida_Nombre, UnidadMedida_Prefijo, UnidadMedida_Factor_Conversion } = unidadData;
        
        // Verificar si el nombre ya existe
           const [existingByName] = await db.execute(
            'SELECT UnidadMedida_Id FROM UnidadesMedida WHERE UnidadMedida_Nombre = ?',
            [UnidadMedida_Nombre]
        );
        
        if (existingByName.length > 0) {
            throw new Error('Ya existe una unidad de medida con este nombre');
        }

        // Verificar si el prefijo ya existe
        const [existingByPrefix] = await db.execute(
            'SELECT UnidadMedida_Id FROM UnidadesMedida WHERE UnidadMedida_Prefijo = ?',
            [UnidadMedida_Prefijo]
        );
        
        if (existingByPrefix.length > 0) {
            throw new Error('Ya existe una unidad de medida con este prefijo');
        }

        const [result] = await db.execute(
            'INSERT INTO UnidadesMedida (UnidadMedida_Nombre, UnidadMedida_Prefijo, UnidadMedida_Factor_Conversion) VALUES (?, ?, ?)',
            [UnidadMedida_Nombre, UnidadMedida_Prefijo, UnidadMedida_Factor_Conversion || null]
        );
        
        return result.insertId;
    }

    /**
     * Obtiene todas las unidades de medida
     * @returns {Promise<Array>} - Array de unidades de medida
     */
    static async findAll() {
        const [unidades] = await db.execute(`
            SELECT 
                UnidadMedida_Id,
                UnidadMedida_Nombre,
                UnidadMedida_Prefijo,
                UnidadMedida_Factor_Conversion
            FROM UnidadesMedida 
            ORDER BY UnidadMedida_Nombre ASC
        `);
        return unidades;
    }

    /**
     * Busca una unidad de medida por ID
     * @param {number} id - ID de la unidad de medida
     * @returns {Promise<Object|undefined>} - Unidad de medida encontrada o undefined
     */
    static async findById(id) {
        const [unidades] = await db.execute(`
            SELECT 
                UnidadMedida_Id,
                UnidadMedida_Nombre,
                UnidadMedida_Prefijo,
                UnidadMedida_Factor_Conversion
            FROM UnidadesMedida 
            WHERE UnidadMedida_Id = ?
        `, [id]);
        return unidades[0];
    }

    /**
     * Busca una unidad de medida por nombre
     * @param {string} nombre - Nombre de la unidad de medida
     * @returns {Promise<Object|undefined>} - Unidad de medida encontrada o undefined
     */
    static async findByName(nombre) {
        const [unidades] = await db.execute(`
            SELECT 
                UnidadMedida_Id,
                UnidadMedida_Nombre,
                UnidadMedida_Prefijo,
                UnidadMedida_Factor_Conversion
            FROM UnidadesMedida 
            WHERE UnidadMedida_Nombre = ?
        `, [nombre]);
        return unidades[0];
    }

    /**
     * Busca una unidad de medida por prefijo
     * @param {string} prefijo - Prefijo de la unidad de medida
     * @returns {Promise<Object|undefined>} - Unidad de medida encontrada o undefined
     */
    static async findByPrefix(prefijo) {
        const [unidades] = await db.execute(`
            SELECT 
                UnidadMedida_Id,
                UnidadMedida_Nombre,
                UnidadMedida_Prefijo,
                UnidadMedida_Factor_Conversion
            FROM UnidadesMedida 
            WHERE UnidadMedida_Prefijo = ?
        `, [prefijo]);
        return unidades[0];
    }

    /**
     * Actualiza una unidad de medida
     * @param {number} id - ID de la unidad de medida
     * @param {Object} unidadData - Datos actualizados de la unidad de medida
     * @returns {Promise<boolean>} - true si se actualizó, false si no
     */
    static async update(id, unidadData) {
        const { UnidadMedida_Nombre, UnidadMedida_Prefijo, UnidadMedida_Factor_Conversion } = unidadData;
        
        // Verificar si el nombre ya existe en otra unidad
        const [existingByName] = await db.execute(
            'SELECT UnidadMedida_Id FROM UnidadesMedida WHERE UnidadMedida_Nombre = ? AND UnidadMedida_Id != ?',
            [UnidadMedida_Nombre, id]
        );
        
        if (existingByName.length > 0) {
            throw new Error('Ya existe una unidad de medida con este nombre');
        }

        // Verificar si el prefijo ya existe en otra unidad
        const [existingByPrefix] = await db.execute(
            'SELECT UnidadMedida_Id FROM UnidadesMedida WHERE UnidadMedida_Prefijo = ? AND UnidadMedida_Id != ?',
            [UnidadMedida_Prefijo, id]
        );
        
        if (existingByPrefix.length > 0) {
            throw new Error('Ya existe una unidad de medida con este prefijo');
        }

        const [result] = await db.execute(
            'UPDATE UnidadesMedida SET UnidadMedida_Nombre = ?, UnidadMedida_Prefijo = ?, UnidadMedida_Factor_Conversion = ? WHERE UnidadMedida_Id = ?',
            [UnidadMedida_Nombre, UnidadMedida_Prefijo, UnidadMedida_Factor_Conversion || null, id]
        );
        
        return result.affectedRows > 0;
    }

    /**
     * Elimina una unidad de medida
     * @param {number} id - ID de la unidad de medida
     * @returns {Promise<boolean>} - true si se eliminó, false si no
     */
    static async delete(id) {
        // Verificar si la unidad de medida está siendo usada por alguna presentación
        const [presentacionesUsing] = await db.execute(
            'SELECT COUNT(*) as count FROM Presentaciones WHERE UnidadMedida_Id = ?',
            [id]
        );
        
        if (presentacionesUsing[0].count > 0) {
            throw new Error('No se puede eliminar la unidad de medida porque está siendo utilizada por una o más presentaciones');
        }

        const [result] = await db.execute(
            'DELETE FROM UnidadesMedida WHERE UnidadMedida_Id = ?',
            [id]
        );
        
        return result.affectedRows > 0;
    }

    /**
     * Cuenta el número total de unidades de medida
     * @returns {Promise<number>} - Número total de unidades de medida
     */
    static async count() {
        const [result] = await db.execute('SELECT COUNT(*) as total FROM UnidadesMedida');
        return result[0].total;
    }

    /**
     * Busca unidades de medida con paginación
     * @param {number} offset - Número de registros a saltar
     * @param {number} limit - Número máximo de registros a retornar
     * @param {string} search - Término de búsqueda (opcional)
     * @returns {Promise<Object>} - Objeto con data y total
     */
    static async findWithPagination(offset = 0, limit = 10, search = '') {
        let query = `
            SELECT 
                UnidadMedida_Id,
                UnidadMedida_Nombre,
                UnidadMedida_Prefijo,
                UnidadMedida_Factor_Conversion
            FROM UnidadesMedida
        `;
        let countQuery = 'SELECT COUNT(*) as total FROM UnidadesMedida';
        let params = [];
        let countParams = [];

        if (search && search.trim() !== '') {
            const searchPattern = `%${search.trim()}%`;
            query += ' WHERE (UnidadMedida_Nombre LIKE ? OR UnidadMedida_Prefijo LIKE ?)';
            countQuery += ' WHERE (UnidadMedida_Nombre LIKE ? OR UnidadMedida_Prefijo LIKE ?)';
            params = [searchPattern, searchPattern];
            countParams = [searchPattern, searchPattern];
        }

        query += ' ORDER BY UnidadMedida_Nombre ASC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const [unidades] = await db.execute(query, params);
        const [countResult] = await db.execute(countQuery, countParams);

        return {
            data: unidades,
            total: countResult[0].total
        };
    }

    /**
     * Verifica si una unidad de medida existe
     * @param {number} id - ID de la unidad de medida
     * @returns {Promise<boolean>} - true si existe, false si no
     */
    static async exists(id) {
        const [unidades] = await db.execute(
            'SELECT UnidadMedida_Id FROM UnidadesMedida WHERE UnidadMedida_Id = ?',
            [id]
        );
        return unidades.length > 0;
    }

    /**
     * Obtiene estadísticas de uso de las unidades de medida
     * @returns {Promise<Object>} - Estadísticas de uso
     */
    static async getUsageStats() {
        const [stats] = await db.execute(`
            SELECT 
                u.UnidadMedida_Id,
                u.UnidadMedida_Nombre,
                u.UnidadMedida_Prefijo,
                COUNT(p.Presentacion_Id) as Total_Presentaciones_Usando
            FROM UnidadesMedida u
            LEFT JOIN Presentaciones p ON u.UnidadMedida_Id = p.UnidadMedida_Id
            GROUP BY u.UnidadMedida_Id, u.UnidadMedida_Nombre, u.UnidadMedida_Prefijo
            ORDER BY Total_Presentaciones_Usando DESC, u.UnidadMedida_Nombre ASC
        `);
        return stats;
    }

    /**
     * Obtiene unidades de medida por factor de conversión (útil para conversiones)
     * @param {number} factorMin - Factor mínimo
     * @param {number} factorMax - Factor máximo
     * @returns {Promise<Array>} - Array de unidades de medida en el rango
     */
    static async findByFactorRange(factorMin, factorMax) {
        const [unidades] = await db.execute(`
            SELECT 
                UnidadMedida_Id,
                UnidadMedida_Nombre,
                UnidadMedida_Prefijo,
                UnidadMedida_Factor_Conversion
            FROM UnidadesMedida 
            WHERE UnidadMedida_Factor_Conversion BETWEEN ? AND ?
            ORDER BY UnidadMedida_Factor_Conversion ASC
        `, [factorMin, factorMax]);
        return unidades;
    }
}

module.exports = UnidadMedidaModel;
