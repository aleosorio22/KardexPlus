const db = require('../../core/config/database');

class BodegaModel {
    /**
     * Crea una nueva bodega en la base de datos
     * @param {Object} bodegaData - Datos de la bodega
     * @returns {Promise<number>} - ID de la bodega creada
     */
    static async create(bodegaData) {
        const {
            Bodega_Nombre,
            Bodega_Tipo,
            Bodega_Ubicacion,
            Responsable_Id,
            Bodega_Estado
        } = bodegaData;

        // Verificar duplicados
        if (await this.existsByName(Bodega_Nombre)) {
            throw new Error('Ya existe una bodega con ese nombre');
        }

        const [result] = await db.execute(`
            INSERT INTO Bodegas (
                Bodega_Nombre,
                Bodega_Tipo,
                Bodega_Ubicacion,
                Responsable_Id,
                Bodega_Estado
            ) VALUES (?, ?, ?, ?, ?)
        `, [
            Bodega_Nombre,
            Bodega_Tipo || null,
            Bodega_Ubicacion || null,
            Responsable_Id || null,
            Bodega_Estado !== undefined ? (Bodega_Estado ? 1 : 0) : 1
        ]);
        
        return result.insertId;
    }

    /**
     * Obtiene todas las bodegas
     * @returns {Promise<Array>} - Array de bodegas
     */
    static async findAll() {
        const [bodegas] = await db.execute(`
            SELECT 
                b.Bodega_Id,
                b.Bodega_Nombre,
                b.Bodega_Tipo,
                b.Bodega_Ubicacion,
                b.Bodega_Estado,
                b.Responsable_Id,
                CONCAT(u.Usuario_Nombre, ' ', u.Usuario_Apellido) as Responsable_Nombre,
                u.Usuario_Correo as Responsable_Correo
            FROM Bodegas b
            LEFT JOIN Usuarios u ON b.Responsable_Id = u.Usuario_Id
            ORDER BY b.Bodega_Nombre ASC
        `);
        return bodegas;
    }

    /**
     * Busca una bodega por ID
     * @param {number} id - ID de la bodega
     * @returns {Promise<Object|undefined>} - Bodega encontrada o undefined
     */
    static async findById(id) {
        const [bodegas] = await db.execute(`
            SELECT 
                b.Bodega_Id,
                b.Bodega_Nombre,
                b.Bodega_Tipo,
                b.Bodega_Ubicacion,
                b.Bodega_Estado,
                b.Responsable_Id,
                CONCAT(u.Usuario_Nombre, ' ', u.Usuario_Apellido) as Responsable_Nombre,
                u.Usuario_Correo as Responsable_Correo
            FROM Bodegas b
            LEFT JOIN Usuarios u ON b.Responsable_Id = u.Usuario_Id
            WHERE b.Bodega_Id = ?
        `, [id]);
        return bodegas[0];
    }

    /**
     * Actualiza una bodega
     * @param {number} id - ID de la bodega
     * @param {Object} bodegaData - Datos actualizados
     * @returns {Promise<boolean>} - true si se actualizó, false si no
     */
    static async update(id, bodegaData) {
        const {
            Bodega_Nombre,
            Bodega_Tipo,
            Bodega_Ubicacion,
            Responsable_Id,
            Bodega_Estado
        } = bodegaData;

        // Verificar duplicados (excluyendo la bodega actual)
        if (await this.existsByName(Bodega_Nombre, id)) {
            throw new Error('Ya existe una bodega con ese nombre');
        }

        const [result] = await db.execute(`
            UPDATE Bodegas SET
                Bodega_Nombre = ?,
                Bodega_Tipo = ?,
                Bodega_Ubicacion = ?,
                Responsable_Id = ?,
                Bodega_Estado = ?
            WHERE Bodega_Id = ?
        `, [
            Bodega_Nombre,
            Bodega_Tipo || null,
            Bodega_Ubicacion || null,
            Responsable_Id || null,
            Bodega_Estado !== undefined ? (Bodega_Estado ? 1 : 0) : 1,
            id
        ]);
        
        return result.affectedRows > 0;
    }

    /**
     * Elimina una bodega (soft delete)
     * @param {number} id - ID de la bodega
     * @returns {Promise<boolean>} - true si se eliminó, false si no
     */
    static async delete(id) {
        const [result] = await db.execute(`
            UPDATE Bodegas SET Bodega_Estado = 0 WHERE Bodega_Id = ?
        `, [id]);
        
        return result.affectedRows > 0;
    }

    /**
     * Restaura una bodega eliminada
     * @param {number} id - ID de la bodega
     * @returns {Promise<boolean>} - true si se restauró, false si no
     */
    static async restore(id) {
        const [result] = await db.execute(`
            UPDATE Bodegas SET Bodega_Estado = 1 WHERE Bodega_Id = ?
        `, [id]);
        
        return result.affectedRows > 0;
    }

    /**
     * Busca bodegas con paginación
     * @param {number} offset - Número de registros a saltar
     * @param {number} limit - Número máximo de registros a retornar
     * @returns {Promise<Object>} - Objeto con data y total
     */
    static async findWithPagination(offset = 0, limit = 10) {
        // Asegurar que offset y limit sean enteros
        const parsedOffset = parseInt(offset, 10) || 0;
        const parsedLimit = parseInt(limit, 10) || 10;
        
        const query = `
            SELECT 
                b.Bodega_Id,
                b.Bodega_Nombre,
                b.Bodega_Tipo,
                b.Bodega_Ubicacion,
                b.Bodega_Estado,
                b.Responsable_Id,
                CONCAT(u.Usuario_Nombre, ' ', u.Usuario_Apellido) as Responsable_Nombre,
                u.Usuario_Correo as Responsable_Correo
            FROM Bodegas b
            LEFT JOIN Usuarios u ON b.Responsable_Id = u.Usuario_Id
            ORDER BY b.Bodega_Nombre ASC 
            LIMIT ${parsedOffset}, ${parsedLimit}
        `;
        
        const countQuery = 'SELECT COUNT(*) as total FROM Bodegas';
        
        const [bodegas] = await db.execute(query); // ya no pasamos parámetros
        const [countResult] = await db.execute(countQuery);
        
        return {
            data: bodegas,
            total: countResult[0].total
        };
    }


    /**
     * Cuenta el número total de bodegas
     * @returns {Promise<number>} - Número total de bodegas
     */
    static async count() {
        const [result] = await db.execute('SELECT COUNT(*) as total FROM Bodegas');
        return result[0].total;
    }

    /**
     * Verifica si una bodega existe
     * @param {number} id - ID de la bodega
     * @returns {Promise<boolean>} - true si existe, false si no
     */
    static async exists(id) {
        const [result] = await db.execute(
            'SELECT COUNT(*) as count FROM Bodegas WHERE Bodega_Id = ?',
            [id]
        );
        return result[0].count > 0;
    }

    /**
     * Verifica si existe una bodega con el nombre dado
     * @param {string} nombre - Nombre de la bodega
     * @param {number} excludeId - ID a excluir de la búsqueda (opcional)
     * @returns {Promise<boolean>} - true si existe, false si no
     */
    static async existsByName(nombre, excludeId = null) {
        let query = 'SELECT COUNT(*) as count FROM Bodegas WHERE Bodega_Nombre = ?';
        let params = [nombre];

        if (excludeId) {
            query += ' AND Bodega_Id != ?';
            params.push(excludeId);
        }

        const [result] = await db.execute(query, params);
        return result[0].count > 0;
    }

    /**
     * Busca bodegas por término
     * @param {string} searchTerm - Término de búsqueda
     * @returns {Promise<Array>} - Array de bodegas encontradas
     */
    static async search(searchTerm) {
        const [bodegas] = await db.execute(`
            SELECT 
                b.Bodega_Id,
                b.Bodega_Nombre,
                b.Bodega_Tipo,
                b.Bodega_Ubicacion,
                b.Bodega_Estado,
                b.Responsable_Id,
                CONCAT(u.Usuario_Nombre, ' ', u.Usuario_Apellido) as Responsable_Nombre
            FROM Bodegas b
            LEFT JOIN Usuarios u ON b.Responsable_Id = u.Usuario_Id
            WHERE b.Bodega_Nombre LIKE ? 
               OR b.Bodega_Ubicacion LIKE ?
               OR CONCAT(u.Usuario_Nombre, ' ', u.Usuario_Apellido) LIKE ?
            ORDER BY b.Bodega_Nombre ASC
            LIMIT 20
        `, [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]);
        
        return bodegas;
    }

    /**
     * Obtiene estadísticas de bodegas
     * @returns {Promise<Object>} - Estadísticas
     */
    static async getStats() {
        const [stats] = await db.execute(`
            SELECT 
                COUNT(*) as total_bodegas,
                COUNT(CASE WHEN Bodega_Estado = true THEN 1 END) as bodegas_activas,
                COUNT(CASE WHEN Bodega_Estado = false THEN 1 END) as bodegas_inactivas,
                COUNT(CASE WHEN Bodega_Tipo = 'Central' THEN 1 END) as bodegas_centrales,
                COUNT(CASE WHEN Bodega_Tipo = 'Producción' THEN 1 END) as bodegas_produccion,
                COUNT(CASE WHEN Bodega_Tipo = 'Frío' THEN 1 END) as bodegas_frio,
                COUNT(CASE WHEN Bodega_Tipo = 'Temporal' THEN 1 END) as bodegas_temporales,
                COUNT(CASE WHEN Responsable_Id IS NOT NULL THEN 1 END) as bodegas_con_responsable
            FROM Bodegas
        `);
        
        return stats[0];
    }

    /**
     * Obtiene bodegas activas para selects/dropdowns
     * @returns {Promise<Array>} - Array de bodegas activas
     */
    static async getActiveBodegas() {
        const [bodegas] = await db.execute(`
            SELECT 
                Bodega_Id,
                Bodega_Nombre,
                Bodega_Tipo
            FROM Bodegas 
            WHERE Bodega_Estado = true
            ORDER BY Bodega_Nombre ASC
        `);
        return bodegas;
    }

    /**
     * Obtiene bodegas por responsable
     * @param {number} responsableId - ID del responsable
     * @returns {Promise<Array>} - Array de bodegas del responsable
     */
    static async findByResponsable(responsableId) {
        const [bodegas] = await db.execute(`
            SELECT 
                b.Bodega_Id,
                b.Bodega_Nombre,
                b.Bodega_Tipo,
                b.Bodega_Ubicacion,
                b.Bodega_Estado
            FROM Bodegas b
            WHERE b.Responsable_Id = ? AND b.Bodega_Estado = true
            ORDER BY b.Bodega_Nombre ASC
        `, [responsableId]);
        return bodegas;
    }

    /**
     * Verifica si se puede eliminar una bodega (no tiene existencias)
     * @param {number} id - ID de la bodega
     * @returns {Promise<boolean>} - true si se puede eliminar, false si no
     */
    static async canDelete(id) {
        const [result] = await db.execute(`
            SELECT COUNT(*) as count 
            FROM Existencias 
            WHERE Bodega_Id = ? AND Cantidad > 0
        `, [id]);
        
        return result[0].count === 0;
    }
}

module.exports = BodegaModel;
